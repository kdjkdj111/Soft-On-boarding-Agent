package com.vector.onboarding.domain.dataview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class GithubFileFetchService {

    @Value("${app.github.api-url}")
    private String githubApiUrl;

    @Value("${app.github.system-token}")
    private String systemToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String fetchFileContent(String repositoryUrl, String filePath) {
        log.info("GitHub API 호출하여 파일 내용을 가져옵니다. repository: {}, path: {}", repositoryUrl, filePath);

        // Github API URL 생성 (예: https://api.github.com/repos/{owner}/{repo}/contents/{path})
        String repoPath = repositoryUrl;
        if (!repoPath.contains("/")) {
            repoPath = "iphysresearch/" + repoPath; // owner 정보가 없으면 기본값 추가
        }
        String url = githubApiUrl + "/repos/" + repoPath + "/contents/" + filePath;

        try {
            HttpHeaders headers = new HttpHeaders();
            if (systemToken != null && !systemToken.trim().isEmpty()) {
                headers.set("Authorization", "Bearer " + systemToken);
            }
            headers.set("Accept", "application/vnd.github.v3.raw");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            String body = response.getBody();

            // .ipynb 파일인 경우 JSON에서 코드 셀만 추출
            if (filePath.endsWith(".ipynb")) {
                return extractCodeFromIpynb(body, filePath);
            }

            return body;
        } catch (Exception e) {
            log.error("GitHub 파일 가져오기 실패: {}", e.getMessage());
            return "// 파일 내용을 가져오는데 실패했습니다: " + filePath;
        }
    }

    /**
     * Jupyter Notebook (.ipynb) JSON 파일에서 코드 셀(code cell)의 소스만 추출하여 하나의 문자열로 반환합니다.
     */
    private String extractCodeFromIpynb(String ipynbJson, String filePath) {
        try {
            JsonNode root = objectMapper.readTree(ipynbJson);
            JsonNode cells = root.path("cells");
            StringBuilder sb = new StringBuilder();
            sb.append("# === SOURCE: ").append(filePath).append(" ===\n");

            if (cells.isArray()) {
                for (JsonNode cell : cells) {
                    String cellType = cell.path("cell_type").asText();
                    if ("code".equals(cellType)) {
                        JsonNode source = cell.path("source");
                        if (source.isArray()) {
                            for (JsonNode line : source) {
                                sb.append(line.asText());
                            }
                        } else if (!source.isMissingNode()) {
                            sb.append(source.asText());
                        }
                        sb.append("\n# --- CELL ---\n");
                    }
                }
            }
            return sb.toString();
        } catch (Exception e) {
            log.warn(".ipynb 파일 파싱 실패 ({}), raw 내용 반환: {}", filePath, e.getMessage());
            return ipynbJson;
        }
    }
}
