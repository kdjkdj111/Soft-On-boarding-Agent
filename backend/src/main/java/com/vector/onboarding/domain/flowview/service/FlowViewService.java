package com.vector.onboarding.domain.flowview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.vector.onboarding.domain.flowview.dto.CreateBoardTaskRequestDto;
import com.vector.onboarding.domain.flowview.entity.BoardTask;
import com.vector.onboarding.domain.flowview.entity.BoardTaskStatus;
import com.vector.onboarding.domain.flowview.entity.CommitHistory;
import com.vector.onboarding.domain.flowview.repository.BoardTaskRepository;
import com.vector.onboarding.domain.flowview.repository.CommitHistoryRepository;
import com.vector.onboarding.domain.space.Space;
import com.vector.onboarding.domain.space.SpaceRepository;
import com.vector.onboarding.global.exception.SpaceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@Transactional
public class FlowViewService {

    private final SpaceRepository spaceRepository;
    private final CommitHistoryRepository commitHistoryRepository;
    private final BoardTaskRepository boardTaskRepository;
    private final WebClient webClient; 

    // 생성자에서 WebClient 빌더에 메모리 버퍼 크기 확장 설정을 주입합니다.
    public FlowViewService(
            SpaceRepository spaceRepository,
            CommitHistoryRepository commitHistoryRepository,
            BoardTaskRepository boardTaskRepository,
            WebClient.Builder webClientBuilder,
            @org.springframework.beans.factory.annotation.Value("${app.github.api-url:https://api.github.com}") String githubApiUrl,
            @org.springframework.beans.factory.annotation.Value("${app.github.system-token:}") String systemToken) {

        this.spaceRepository = spaceRepository;
        this.commitHistoryRepository = commitHistoryRepository;
        this.boardTaskRepository = boardTaskRepository;

        // 깃허브 대용량 커밋 JSON 수신 시 발생하는 버퍼 제한 에러 해결을 위해 10MB로 확장
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();

        WebClient.Builder builder = webClientBuilder
                .baseUrl(githubApiUrl)
                .exchangeStrategies(strategies); 

        if (systemToken != null && !systemToken.isEmpty()) {
            builder.defaultHeader("Authorization", "Bearer " + systemToken);
        }
        
        this.webClient = builder
                .defaultHeader("Accept", "application/vnd.github.v3+json")
                .defaultHeader("User-Agent", "Soft-Onboarding-Agent") 
                .build();
    }

    /**
     * 특정 팀 코드의 커밋 내역을 DB에서 반환합니다. (기본 조회 기능)
     */
    @Transactional(readOnly = true)
    public List<CommitHistory> getCommitsByTeamCode(String teamCode) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        String repoUrl = space.getRepoUrl();
        String[] parsed = parseGithubUrl(repoUrl);
        if (parsed == null) {
            log.error("잘못된 repo_url 형식: {}", repoUrl);
            return java.util.Collections.emptyList();
        }
        String repoName = parsed[1];

        return commitHistoryRepository.findByRepoNameOrderByCommitDateDesc(repoName);
    }

    /**
     * 🔄 깃허브 API를 명시적으로 호출하여 최신 커밋 내역을 가져온 뒤 DB에 동기화합니다.
     */
    @Transactional
    public List<CommitHistory> syncCommitsByTeamCode(String teamCode) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        String repoUrl = space.getRepoUrl();
        String[] parsed = parseGithubUrl(repoUrl);
        if (parsed == null) {
            log.error("잘못된 repo_url 형식: {}", repoUrl);
            return getCommitsByTeamCode(teamCode);
        }
        
        String owner = parsed[0];
        String repoName = parsed[1];

        log.info("🔄 깃허브 최신 커밋 데이터 동기화 파이프라인 가동: {}/{}", owner, repoName);

        try {
            // 확장된 버퍼 세팅이 적용되어 대용량의 100개 커밋 데이터도 끊김 없이 정상 수신합니다.
            JsonNode commitsJson = webClient.get()
                    .uri("/repos/{owner}/{repo}/commits?per_page=100", owner, repoName)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (commitsJson != null && commitsJson.isArray()) {
                List<CommitHistory> newCommits = new ArrayList<>();

                for (JsonNode commitNode : commitsJson) {
                    String sha = commitNode.path("sha").asText();

                    // [중복 방지 체크] 동일한 SHA 식별자가 DB에 존재하면 적재 대상에서 제외
                    if (commitHistoryRepository.existsByCommitSha(sha)) {
                        continue; 
                    }

                    String message = commitNode.path("commit").path("message").asText();
                    String authorName = commitNode.path("commit").path("author").path("name").asText();
                    String commitDateStr = commitNode.path("commit").path("author").path("date").asText();

                    CommitHistory commitHistory = CommitHistory.builder()
                            .repoName(repoName)
                            .commitSha(sha)
                            .message(message)
                            .author(authorName)
                            .commitDate(commitDateStr)
                            .build();

                    newCommits.add(commitHistory);
                }

                // 신규 식별된 커밋 집합이 존재할 때만 Bulk Insert 수행
                if (!newCommits.isEmpty()) {
                    commitHistoryRepository.saveAll(newCommits);
                    log.info("정상적으로 {}건의 신규 커밋 내역을 로컬 데이터베이스에 저장했습니다.", newCommits.size());
                } else {
                    log.info("로컬 데이터의 정합성이 원격지와 일치합니다. 추가할 내역이 없습니다.");
                }
            }
        } catch (Exception e) {
            log.error("❌ 깃허브 원격 동기화 중 스트리밍 에러 발생: {}", e.getMessage());
        }

        return commitHistoryRepository.findByRepoNameOrderByCommitDateDesc(repoName);
    }

    /**
     * 주소 문자열로부터 소유자(owner)와 레포지토리 이름(repoName)을 추출하는 파서 유틸리티
     */
    private String[] parseGithubUrl(String repoUrl) {
        if (repoUrl == null || repoUrl.isBlank()) return null;
        String urlPath = repoUrl.trim();
        urlPath = urlPath.replaceAll("\\.git$", "");
        urlPath = urlPath.replaceAll("/+$", ""); 
        String[] parts = urlPath.split("/");
        if (parts.length < 2) return null;
        return new String[]{ parts[parts.length - 2], parts[parts.length - 1] };
    }

    // =====================================================================
    // BoardTask (칸반 보드 데이터 컴포넌트) CRUD 영역
    // =====================================================================

    public BoardTask createTask(String teamCode, CreateBoardTaskRequestDto dto) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        BoardTask task = BoardTask.builder()
                .spaceId(space.getId())
                .title(dto.getTitle())
                .status(dto.getStatus() != null ? dto.getStatus() : BoardTaskStatus.TODO)
                .assignee(dto.getAssignee())
                .label(dto.getLabel())
                .build();

        return boardTaskRepository.save(task);
    }

    @Transactional(readOnly = true)
    public List<BoardTask> getTasksByTeamCode(String teamCode) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));
        return boardTaskRepository.findBySpaceId(space.getId());
    }

    public BoardTask updateTask(Long taskId, CreateBoardTaskRequestDto dto) {
        BoardTask task = boardTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.update(dto.getTitle(), dto.getStatus(), dto.getAssignee(), dto.getLabel());
        return task;
    }

    public BoardTask updateTaskStatus(Long taskId, BoardTaskStatus newStatus) {
        BoardTask task = boardTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.update(null, newStatus, null, null);
        return task;
    }

    public void deleteTask(Long taskId) {
        if (!boardTaskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found: " + taskId);
        }
        boardTaskRepository.deleteById(taskId);
    }
}