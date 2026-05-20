package com.vector.onboarding.infrastructure.github;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Paths;

/**
 * GithubAnalysisService의 임시 Stub 구현체.
 * 팀원의 실제 구현이 완료되면 이 클래스를 제거하거나 @Primary를 제거합니다.
 */
@Slf4j
@Service
@Primary
public class GithubAnalysisServiceStub implements GithubAnalysisService {

    @Async("githubAnalysisExecutor")
    @Override
    public void analyzeAndSaveProjectStructure(Long spaceId, String repoUrl) {
        log.info("[GithubAnalysisService] 파이썬 LLM 파이프라인 호출 시작 - spaceId: {}, repoUrl: {}", spaceId, repoUrl);
        try {
            // 상위 폴더의 LLM-Pipeline 스크립트 경로를 가리킵니다 (backend 실행 위치 기준)
            String pythonScriptPath = Paths.get("..", "LLM-Pipeline", "SOA_LLM_Model.py").toString(); 
            
            ProcessBuilder processBuilder = new ProcessBuilder(
                    "python", pythonScriptPath, repoUrl
            );
            
            // 에러 로그까지 합쳐서 스프링부트 로그로 봅니다
            processBuilder.redirectErrorStream(true); 
            Process process = processBuilder.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("[LLM-Pipeline] {}", line); // 파이썬의 print()가 여기 찍힙니다
                }
            }

            int exitCode = process.waitFor();
            if (exitCode == 0) {
                log.info("[GithubAnalysisService] ✅ 파이프라인 실행 성공!");
            } else {
                log.error("[GithubAnalysisService] ❌ 파이프라인 실행 실패 (종료 코드: {})", exitCode);
            }
        } catch (Exception e) {
            log.error("[GithubAnalysisService] 파이프라인 실행 중 예외 발생", e);
        }
    }
}
