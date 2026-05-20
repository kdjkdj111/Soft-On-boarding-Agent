package com.vector.onboarding.domain.dataview.service;

import com.vector.onboarding.domain.dataview.entity.ComponentNode;
import com.vector.onboarding.domain.dataview.entity.GithubFileInfo;
import com.vector.onboarding.domain.dataview.entity.SchemaAnalysisResult;
import com.vector.onboarding.domain.dataview.repository.ComponentNodeRepository;
import com.vector.onboarding.domain.dataview.repository.GithubFileRepository;
import com.vector.onboarding.domain.dataview.repository.SchemaAnalysisResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DataViewService {

    private final ComponentNodeRepository componentNodeRepository;
    private final SchemaAnalysisResultRepository schemaAnalysisResultRepository;
    private final GithubFileFetchService githubFileFetchService;
    private final SchemaParserService schemaParserService;

    @Transactional
    public String getOrAnalyzeSchema(String repositoryUrl) {
        // 1. ComponentNodes DB에서 파일 정보 조회
        List<ComponentNode> nodes = componentNodeRepository.findByRepoNameAndCategory(repositoryUrl, "Data");
        
        if (nodes.isEmpty()) {
            log.warn("DB에 파일 정보(ComponentNodes)가 없습니다. repositoryUrl: {}", repositoryUrl);
            return "{ \"nodes\": [], \"edges\": [] }";
        }

        // 2. 가장 최근 등록된 노드 시간 확인
        java.time.LocalDateTime maxCreatedAt = nodes.stream()
                .map(ComponentNode::getCreatedAt)
                .filter(java.util.Objects::nonNull)
                .max(java.time.LocalDateTime::compareTo)
                .orElse(null);

        // 3. 캐시 확인
        Optional<SchemaAnalysisResult> cachedResult = schemaAnalysisResultRepository.findByRepositoryUrl(repositoryUrl);
        
        if (cachedResult.isPresent()) {
            SchemaAnalysisResult result = cachedResult.get();
            // 캐시의 분석 시간보다 최신인 ComponentNode가 없다면 캐시 히트
            if (maxCreatedAt == null || !maxCreatedAt.isAfter(result.getAnalyzedAt())) {
                log.info("캐시 히트: 새로운 데이터 노드가 없음, 기존 분석 데이터를 반환합니다.");
                return result.getAnalyzedJson();
            }
        }

        // 4. 새로운 데이터 노드 감지됨 (또는 캐시 없음). 파일 내용 Github API로 가져오기
        log.info("새로운 데이터 감지됨 (또는 캐시 없음). Github API를 통해 파일 내용을 가져옵니다.");
        String combinedFileContents = nodes.stream()
                .map(node -> {
                    String content = githubFileFetchService.fetchFileContent(repositoryUrl, node.getFilePath());
                    return "--- File: " + node.getFilePath() + " ---\n" + content + "\n";
                })
                .collect(Collectors.joining("\n"));

        // 5. 정규식 파서를 통한 전체 병합 파싱
        log.info("Java 정규식 기반 스키마 분석을 시작합니다.");
        String analyzedJson = schemaParserService.parseSchema(combinedFileContents);

        // 6. 결과를 DB에 저장/업데이트
        String dummyCommitHash = "fetched-at-" + System.currentTimeMillis();
        if (cachedResult.isPresent()) {
            SchemaAnalysisResult result = cachedResult.get();
            result.updateAnalysis(dummyCommitHash, analyzedJson);
        } else {
            SchemaAnalysisResult newResult = SchemaAnalysisResult.builder()
                    .repositoryUrl(repositoryUrl)
                    .commitHash(dummyCommitHash) // Commit hash is no longer the main cache key, but required by entity
                    .analyzedJson(analyzedJson)
                    .build();
            schemaAnalysisResultRepository.save(newResult);
        }

        return analyzedJson;
    }
}
