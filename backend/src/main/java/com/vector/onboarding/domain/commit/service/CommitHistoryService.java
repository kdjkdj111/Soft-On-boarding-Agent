package com.vector.onboarding.domain.commit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.vector.onboarding.domain.commit.dto.CommitHistoryResponseDto;
import com.vector.onboarding.domain.commit.entity.CommitHistory;
import com.vector.onboarding.domain.commit.repository.CommitHistoryRepository;
import com.vector.onboarding.domain.dataview.service.GithubFileFetchService;
import com.vector.onboarding.domain.space.Space;
import com.vector.onboarding.domain.space.SpaceRepository;
import com.vector.onboarding.global.exception.SpaceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommitHistoryService {

    private final CommitHistoryRepository commitHistoryRepository;
    private final SpaceRepository spaceRepository;
    private final GithubFileFetchService githubFileFetchService;

    @Transactional(readOnly = true)
    public List<CommitHistoryResponseDto> getCommitHistoryBySpaceId(Long spaceId) {
        return commitHistoryRepository.findBySpaceIdOrderByIdDesc(spaceId).stream()
                .map(CommitHistoryResponseDto::from)
                .collect(Collectors.toList());
    }

    /**
     * 특정 팀 코드의 커밋 내역을 반환합니다.
     * DB에 해당 spaceId의 커밋이 없으면 spaces 테이블의 repo_url을 기반으로
     * GitHub에서 자동 동기화한 뒤 반환합니다. (온디맨드 동기화)
     */
    public List<CommitHistory> getCommitsByTeamCode(String teamCode) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        List<CommitHistory> existing = commitHistoryRepository.findBySpaceIdOrderByIdDesc(space.getId());

        // DB에 커밋이 없으면 → repo_url 기반으로 온디맨드 동기화
        if (existing.isEmpty() && space.getRepoUrl() != null && !space.getRepoUrl().isBlank()) {
            log.info("[온디맨드 동기화] spaceId={} 커밋 없음. repo_url={} 에서 fetch 시도",
                    space.getId(), space.getRepoUrl());
            existing = syncCommitsFromGithub(space);
        }

        return existing;
    }

    /**
     * 특정 팀 코드의 커밋을 GitHub에서 강제 재동기화합니다.
     * 기존 커밋은 삭제 후 최신 데이터로 교체합니다.
     */
    public List<CommitHistory> syncCommitsByTeamCode(String teamCode) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        if (space.getRepoUrl() == null || space.getRepoUrl().isBlank()) {
            log.warn("[재동기화] spaceId={} 에 repo_url 없음. 건너뜁니다.", space.getId());
            return java.util.Collections.emptyList();
        }

        // 기존 커밋 삭제 (덮어쓰기)
        List<CommitHistory> old = commitHistoryRepository.findBySpaceIdOrderByIdDesc(space.getId());
        if (!old.isEmpty()) {
            commitHistoryRepository.deleteAll(old);
            log.info("[재동기화] 기존 커밋 {}건 삭제", old.size());
        }

        return syncCommitsFromGithub(space);
    }

    /**
     * 내부 공통 메서드: Space 엔티티를 받아 GitHub에서 커밋을 fetch하고 저장 후 반환합니다.
     */
    public List<CommitHistory> syncCommitsFromGithub(Space space) {
        String repoUrl = space.getRepoUrl();
        String urlPath = repoUrl.replace("https://github.com/", "").replace(".git", "");
        String[] parts = urlPath.split("/");
        if (parts.length < 2) {
            log.error("잘못된 repo_url 형식: {}", repoUrl);
            return java.util.Collections.emptyList();
        }
        String owner = parts[0];
        String repo  = parts[1];

        try {
            JsonNode commits = githubFileFetchService.fetchCommits(owner, repo);

            if (commits == null || !commits.isArray() || commits.size() == 0) {
                log.info("[동기화] GitHub 커밋 없음 - owner={}, repo={}", owner, repo);
                return java.util.Collections.emptyList();
            }

            List<CommitHistory> histories = new ArrayList<>();
            for (JsonNode node : commits) {
                String sha     = node.get("sha").asText();
                String message = node.get("commit").get("message").asText();
                String author  = node.get("commit").get("author").get("name").asText();
                String date    = node.get("commit").get("author").get("date").asText();

                histories.add(CommitHistory.builder()
                        .spaceId(space.getId())
                        .repoName(repo)
                        .commitSha(sha)
                        .message(message)
                        .commitDate(date)
                        .author(author)
                        .build());
            }

            List<CommitHistory> saved = commitHistoryRepository.saveAll(histories);
            log.info("[동기화] {}건 저장 완료 - spaceId={}", saved.size(), space.getId());
            return commitHistoryRepository.findBySpaceIdOrderByIdDesc(space.getId());

        } catch (Exception e) {
            log.error("[동기화] GitHub fetch 실패: {}", e.getMessage(), e);
            return java.util.Collections.emptyList();
        }
    }
}
