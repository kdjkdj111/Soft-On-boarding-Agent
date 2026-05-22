package com.vector.onboarding.domain.dataview.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
public class GithubFileFetchService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper(); // Jupyter 파싱을 위한 도구 추가

    public GithubFileFetchService(
            WebClient.Builder webClientBuilder,
            @Value("${app.github.api-url:https://api.github.com}") String githubApiUrl,
            @Value("${app.github.system-token:}") String systemToken) {
        
        WebClient.Builder builder = webClientBuilder.baseUrl(githubApiUrl);
        
        if (systemToken != null && !systemToken.isEmpty()) {
            builder.defaultHeader("Authorization", "Bearer " + systemToken);
        }
        
        this.webClient = builder
                .defaultHeader("Accept", "application/vnd.github.v3+json")
                .build();
    }

    /**
     * GitHub Git Trees API 호출 (재귀적)
     */
    public JsonNode fetchGitTree(String owner, String repo, String branchSha) {
        log.info("Fetching git tree for {}/{} at {}", owner, repo, branchSha);
        return webClient.get()
                .uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1", owner, repo, branchSha)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    /**
     * GitHub Commits API 호출 (최근 100개)
     */
    public JsonNode fetchCommits(String owner, String repo) {
        log.info("Fetching commits for {}/{}", owner, repo);
        return webClient.get()
                .uri("/repos/{owner}/{repo}/commits?per_page=100", owner, repo)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    /**
     * GitHub Commits API 호출 - 특정 파일을 수정한 커밋만 필터링합니다.
     * GitHub API의 ?path= 파라미터를 활용하여 서버 측에서 직접 필터링합니다.
     * 결과는 FunctionalViewService에서 @Cacheable로 캐싱되므로 반복 호출이 발생하지 않습니다.
     *
     * @param owner    레포지토리 소유자 (예: "octocat")
     * @param repo     레포지토리 이름 (예: "hello-world")
     * @param filePath 필터링할 파일 경로 (예: "src/main/java/.../UserService.java")
     * @return 해당 파일을 수정한 커밋 목록 JsonNode
     */
    public JsonNode fetchCommitsByFilePath(String owner, String repo, String filePath) {
        log.info("Fetching commits for {}/{} filtered by path: {}", owner, repo, filePath);
        return webClient.get()
                .uri("/repos/{owner}/{repo}/commits?path={filePath}&per_page=30",
                        owner, repo, filePath)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .onErrorReturn(com.fasterxml.jackson.databind.node.NullNode.getInstance())
                .block();
    }

    /**
     * GitHub API 호출하여 파일 내용을 가져옵니다. (DataViewService 연동용)
     */
    public String fetchFileContent(String repositoryUrl, String filePath) {
        log.info("Fetching file content for repo: {}, path: {}", repositoryUrl, filePath);
        
        String urlPath = repositoryUrl.replace("https://github.com/", "").replace(".git", "");
        String[] parts = urlPath.split("/");
        if (parts.length < 2) {
            log.error("잘못된 레포지토리 URL 형식입니다: {}", repositoryUrl);
            return "// 파일 내용을 가져오는데 실패했습니다: " + filePath;
        }
        String owner = parts[0];
        String repo = parts[1];

        try {
            String uri = "/repos/" + owner + "/" + repo + "/contents/" + filePath;
            String body = webClient.get()
                    .uri(uri)
                    .header("Accept", "application/vnd.github.v3.raw")
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            // .ipynb 파일인 경우 JSON에서 코드 셀만 추출 (팀원 로직 병합)
            if (filePath != null && filePath.endsWith(".ipynb")) {
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