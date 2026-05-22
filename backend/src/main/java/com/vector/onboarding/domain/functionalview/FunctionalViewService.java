package com.vector.onboarding.domain.functionalview;

import com.fasterxml.jackson.databind.JsonNode;
import com.vector.onboarding.domain.dataview.service.GithubFileFetchService;
import com.vector.onboarding.domain.functionalview.dto.CommitSummaryDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalViewEdgeDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalViewNodeDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalViewResponseDto;
import com.vector.onboarding.domain.space.Space;
import com.vector.onboarding.domain.space.SpaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Functional View 조회 및 React Flow 변환 서비스.
 * DB에서 FunctionalElement를 조회하여 React Flow 규격(nodes + edges)으로 변환합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FunctionalViewService {

    private final FunctionalElementRepository functionalElementRepository;
    private final SpaceRepository spaceRepository;
    private final GithubFileFetchService githubFileFetchService;

    /**
     * 특정 스페이스의 Functional View 데이터를 React Flow 규격으로 반환합니다.
     *
     * @param spaceId 조회할 스페이스 ID
     * @return React Flow nodes + edges 구조
     */
    public FunctionalViewResponseDto getFunctionalView(Long spaceId) {
        List<FunctionalElement> elements =
                functionalElementRepository.findBySpaceIdOrderByParentIdAscIdAsc(spaceId);

        if (elements.isEmpty()) {
            log.warn("spaceId={}에 해당하는 FunctionalElement가 없습니다.", spaceId);
            return FunctionalViewResponseDto.builder()
                    .nodes(List.of())
                    .edges(List.of())
                    .build();
        }

        log.info("spaceId={}의 FunctionalElement {} 개를 React Flow 규격으로 변환합니다.", spaceId, elements.size());

        List<FunctionalViewNodeDto> nodes = new ArrayList<>();
        List<FunctionalViewEdgeDto> edges = new ArrayList<>();

        for (FunctionalElement element : elements) {
            // 1. 노드 변환
            nodes.add(toNodeDto(element));

            // 2. 부모가 있는 경우 엣지 자동 생성
            if (element.getParentId() != null) {
                edges.add(FunctionalViewEdgeDto.builder()
                        .id("e-" + element.getParentId() + "-" + element.getId())
                        .source(String.valueOf(element.getParentId()))
                        .target(String.valueOf(element.getId()))
                        .animated(true)
                        .build());
            }
        }

        return FunctionalViewResponseDto.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }

    /**
     * FunctionalElement → React Flow Node DTO로 변환합니다.
     * elementType에 따라 노드 타입과 data 내용이 달라집니다.
     */
    private FunctionalViewNodeDto toNodeDto(FunctionalElement element) {
        String nodeType = switch (element.getElementType()) {
            case FOREST -> "forestNode";
            case TREE   -> "treeNode";
            case RING   -> "ringNode";
        };

        Map<String, Object> data = buildNodeData(element);

        return FunctionalViewNodeDto.builder()
                .id(String.valueOf(element.getId()))
                .type(nodeType)
                .parentId(element.getParentId() != null ? String.valueOf(element.getParentId()) : null)
                .data(data)
                .build();
    }

    /**
     * elementType에 따라 React Flow 노드의 data 맵을 구성합니다.
     */
    private Map<String, Object> buildNodeData(FunctionalElement element) {
        Map<String, Object> data = new HashMap<>();
        data.put("label", element.getName());

        if (element.getDescription() != null) {
            data.put("description", element.getDescription());
        }

        switch (element.getElementType()) {
            case FOREST -> {
                // Forest 노드: label + description만
            }
            case TREE -> {
                // Tree 노드: filePath 추가
                if (element.getFilePath() != null) {
                    data.put("filePath", element.getFilePath());
                }
            }
            case RING -> {
                // Ring 노드: filePath + HTTP 엔드포인트 정보 추가
                if (element.getFilePath() != null) {
                    data.put("filePath", element.getFilePath());
                }
                if (element.getApiMethod() != null) {
                    data.put("apiMethod", element.getApiMethod());
                }
                if (element.getApiUrl() != null) {
                    data.put("apiUrl", element.getApiUrl());
                }
            }
        }

        return data;
    }

    /**
     * 특정 FunctionalElement(노드)와 연관된 커밋 히스토리를 반환합니다.
     *
     * <p>동작 방식:
     * <ol>
     *   <li>elementId로 FunctionalElement 조회 → filePath / repoName 추출</li>
     *   <li>spaceId로 Space 조회 → repoUrl에서 owner 파싱</li>
     *   <li>GitHub API ({@code ?path=filePath}) 호출 → 해당 파일 수정 커밋만 필터링</li>
     *   <li>결과를 {@code functionalCommits} 캐시에 저장 (key = elementId)</li>
     * </ol>
     *
     * <p>FOREST 노드처럼 filePath가 null인 경우 빈 리스트를 반환합니다.
     *
     * @param spaceId   멤버십 검증에 사용된 스페이스 ID
     * @param elementId 커밋 히스토리를 조회할 FunctionalElement ID
     * @return 해당 파일을 수정한 커밋 목록 (최대 30개)
     */
    @Cacheable(value = "functionalCommits", key = "#elementId")
    public List<CommitSummaryDto> getCommitsForElement(Long spaceId, Long elementId) {
        // 1. FunctionalElement 조회
        FunctionalElement element = functionalElementRepository.findById(elementId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 FunctionalElement입니다: " + elementId));

        // 2. filePath가 없는 노드(FOREST 등)는 빈 리스트 반환
        String filePath = element.getFilePath();
        if (filePath == null || filePath.isBlank()) {
            log.info("elementId={}는 filePath가 없어 커밋 조회를 건너뜁니다. (elementType={})",
                    elementId, element.getElementType());
            return Collections.emptyList();
        }

        // 3. Space에서 repoUrl 조회 → owner / repo 파싱
        Space space = spaceRepository.findById(spaceId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 Space입니다: " + spaceId));

        String repoUrl = space.getRepoUrl();
        if (repoUrl == null || repoUrl.isBlank()) {
            log.warn("spaceId={}에 repoUrl이 없습니다.", spaceId);
            return Collections.emptyList();
        }

        String urlPath = repoUrl.replace("https://github.com/", "").replace(".git", "");
        String[] parts = urlPath.split("/");
        if (parts.length < 2) {
            log.error("잘못된 repoUrl 형식: {}", repoUrl);
            return Collections.emptyList();
        }
        String owner = parts[0];
        String repo = parts[1];

        // 4. GitHub API 호출 (해당 파일을 수정한 커밋만 필터링)
        log.info("GitHub API 호출: owner={}, repo={}, path={}", owner, repo, filePath);
        JsonNode commits = githubFileFetchService.fetchCommitsByFilePath(owner, repo, filePath);

        if (commits == null || !commits.isArray() || commits.isEmpty()) {
            return Collections.emptyList();
        }

        // 5. JsonNode → CommitSummaryDto 변환
        List<CommitSummaryDto> result = new ArrayList<>();
        for (JsonNode node : commits) {
            String sha = node.path("sha").asText("");
            String message = node.path("commit").path("message").asText("");
            // 커밋 메시지 첫 줄만 (멀티라인 메시지 처리)
            String shortMessage = message.contains("\n") ? message.split("\n")[0] : message;
            String author = node.path("commit").path("author").path("name").asText("");
            String date = node.path("commit").path("author").path("date").asText("");
            String htmlUrl = node.path("html_url").asText(null);

            result.add(CommitSummaryDto.builder()
                    .sha(sha.length() > 7 ? sha.substring(0, 7) : sha)
                    .message(shortMessage)
                    .author(author)
                    .date(date)
                    .url(htmlUrl)
                    .build());
        }

        log.info("elementId={}의 커밋 {}건 조회 완료 (캐시 저장).", elementId, result.size());
        return result;
    }
}
