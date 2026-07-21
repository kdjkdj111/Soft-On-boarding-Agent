package com.vector.onboarding.domain.space;

import com.fasterxml.jackson.databind.JsonNode;
import com.vector.onboarding.domain.commit.entity.CommitHistory;
import com.vector.onboarding.domain.commit.repository.CommitHistoryRepository;
import com.vector.onboarding.domain.dataview.entity.GithubFileInfo;
import com.vector.onboarding.domain.dataview.repository.GithubFileRepository;
import com.vector.onboarding.domain.dataview.service.GithubFileFetchService;
import com.vector.onboarding.domain.space.dto.CreateSpaceRequestDto;
import com.vector.onboarding.domain.space.dto.CreateSpaceResponseDto;
import com.vector.onboarding.domain.space.dto.MemberResponseDto;
import com.vector.onboarding.domain.user.User;
import com.vector.onboarding.domain.user.UserRepository;
import com.vector.onboarding.global.exception.AccessDeniedException;
import com.vector.onboarding.global.exception.SpaceNotFoundException;
import com.vector.onboarding.global.exception.UserNotFoundException;
import com.vector.onboarding.infrastructure.github.GithubAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SpaceService {

    private final SpaceRepository spaceRepository;
    private final SpaceMemberRepository spaceMemberRepository;
    private final UserRepository userRepository;
    private final GithubAnalysisService githubAnalysisService;
    private final GithubFileFetchService githubFileFetchService;
    private final GithubFileRepository githubFileRepository;
    private final CommitHistoryRepository commitHistoryRepository;

    private static final int TEAM_CODE_LENGTH = 8;
    private static final String TEAM_CODE_CHARS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * 팀 스페이스를 생성합니다.
     */
    public CreateSpaceResponseDto createSpace(Long userId, CreateSpaceRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        String teamCode = generateUniqueTeamCode();

        Space space = Space.builder()
                .name(dto.getName())
                .repoUrl(dto.getRepoUrl())
                .teamCode(teamCode)
                .createdBy(userId)
                .build();
        Space savedSpace = spaceRepository.save(space);

        SpaceMember adminMember = SpaceMember.builder()
                .spaceId(savedSpace.getId())
                .userId(userId)
                .memberRole(SpaceMemberRole.ADMIN)
                .jobRole(dto.getJobRole())
                .build();
        spaceMemberRepository.save(adminMember);

        user.updateTeamCode(teamCode);
        userRepository.save(user);

        githubAnalysisService.analyzeAndSaveProjectStructure(savedSpace.getId(), dto.getRepoUrl());
        log.info("Space 생성 완료 및 AI 파이프라인 분석 완료. spaceId={}, teamCode={}", savedSpace.getId(), teamCode);

        return new CreateSpaceResponseDto(savedSpace.getId(), teamCode);
    }

    /**
     * teamCode를 통해 팀 스페이스에 참여합니다.
     */
    public void joinSpace(Long userId, String teamCode, String jobRole) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        if (spaceMemberRepository.existsBySpaceIdAndUserId(space.getId(), userId)) {
            throw new IllegalArgumentException("이미 참여한 팀 스페이스입니다.");
        }

        SpaceMember member = SpaceMember.builder()
                .spaceId(space.getId())
                .userId(userId)
                .memberRole(SpaceMemberRole.MEMBER)
                .jobRole(jobRole)
                .build();
        spaceMemberRepository.save(member);

        user.updateTeamCode(teamCode);
        userRepository.save(user);

        log.info("Space 참여 완료. userId={}, spaceId={}, teamCode={}", userId, space.getId(), teamCode);
    }

    /**
     * 팀 스페이스에서 탈퇴합니다.
     */
    public void leaveSpace(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        String teamCode = user.getTeamCode();
        if (teamCode == null || teamCode.isEmpty()) {
            throw new IllegalStateException("소속된 팀이 없습니다.");
        }

        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        SpaceMember currentMember = spaceMemberRepository.findBySpaceIdAndUserId(space.getId(), userId)
                .orElseThrow(() -> new RuntimeException("SpaceMember mapping not found"));

        if (currentMember.getMemberRole() == SpaceMemberRole.ADMIN) {
            List<SpaceMember> members = spaceMemberRepository.findAllBySpaceId(space.getId());
            if (members.size() == 1) {
                spaceMemberRepository.delete(currentMember);
                spaceRepository.delete(space);
            } else {
                SpaceMember nextAdmin = members.stream()
                        .filter(m -> !m.getUserId().equals(userId))
                        .min(java.util.Comparator.comparing(SpaceMember::getJoinedAt))
                        .orElseThrow(() -> new RuntimeException("위임할 대상이 없습니다."));
                
                nextAdmin.changeRole(SpaceMemberRole.ADMIN);
                spaceMemberRepository.save(nextAdmin);
                spaceMemberRepository.delete(currentMember);
            }
        } else {
            spaceMemberRepository.delete(currentMember);
        }

        user.updateTeamCode(null);
    }

    /**
     * 특정 스페이스의 전체 팀원 목록을 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<MemberResponseDto> getMembers(Long requestUserId, Long spaceId) {
        checkSpaceMembership(requestUserId, spaceId);

        List<SpaceMember> members = spaceMemberRepository.findAllBySpaceId(spaceId);

        List<Long> userIds = members.stream()
                .map(SpaceMember::getUserId)
                .collect(Collectors.toList());
        Map<Long, User> userMap = userRepository.findAllByIdIn(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return members.stream()
                .map(m -> {
                    User user = userMap.get(m.getUserId());
                    return new MemberResponseDto(
                            user.getId(),
                            user.getUsername(),
                            user.getEmail(),
                            m.getJobRole(),
                            m.getMemberRole() == SpaceMemberRole.ADMIN
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * 대상 유저에게 ADMIN 권한을 부여합니다.
     */
    public void assignAdmin(Long requestUserId, Long spaceId, Long targetUserId) {
        checkAdminPermission(requestUserId, spaceId);

        SpaceMember targetMember = spaceMemberRepository.findBySpaceIdAndUserId(spaceId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저는 이 스페이스의 멤버가 아닙니다."));

        targetMember.changeRole(SpaceMemberRole.ADMIN);
        log.info("ADMIN 권한 부여. requestUserId={}, targetUserId={}, spaceId={}", requestUserId, targetUserId, spaceId);
    }

    /**
     * 대상 유저를 팀에서 추방합니다.
     */
    public void kickMember(Long requestUserId, Long spaceId, Long targetUserId) {
        checkAdminPermission(requestUserId, spaceId);

        if (requestUserId.equals(targetUserId)) {
            throw new IllegalArgumentException("자기 자신을 추방할 수 없습니다. 탈퇴는 '/leave'를 이용해 주세요.");
        }

        SpaceMember targetMember = spaceMemberRepository.findBySpaceIdAndUserId(spaceId, targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("해당 유저는 이 스페이스의 멤버가 아닙니다."));

        if (targetMember.getMemberRole() == SpaceMemberRole.ADMIN) {
            List<SpaceMember> admins = spaceMemberRepository.findAllBySpaceIdAndMemberRole(spaceId, SpaceMemberRole.ADMIN);
            if (admins.size() <= 1) {
                throw new IllegalArgumentException("마지막 관리자는 추방할 수 없습니다. 먼저 다른 멤버에게 관리자 권한을 부여해 주세요.");
            }
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + targetUserId));
        spaceMemberRepository.delete(targetMember);
        targetUser.updateTeamCode(null);

        log.info("팀원 추방 완료. requestUserId={}, targetUserId={}, spaceId={}", requestUserId, targetUserId, spaceId);
    }

    /**
     * 요청자가 해당 스페이스의 멤버인지 검증합니다.
     */
    public void checkSpaceMembership(Long userId, Long spaceId) {
        if (!spaceMemberRepository.existsBySpaceIdAndUserId(spaceId, userId)) {
            throw new AccessDeniedException("해당 스페이스에 접근 권한이 없습니다.");
        }
    }

    /**
     * 요청자가 해당 스페이스의 ADMIN인지 검증합니다.
     */
    private void checkAdminPermission(Long userId, Long spaceId) {
        SpaceMember member = spaceMemberRepository.findBySpaceIdAndUserId(spaceId, userId)
                .orElseThrow(() -> new AccessDeniedException("해당 스페이스에 접근 권한이 없습니다."));
        if (member.getMemberRole() != SpaceMemberRole.ADMIN) {
            throw new AccessDeniedException("해당 스페이스에 대한 관리자 권한이 없습니다.");
        }
    }

    String generateUniqueTeamCode() {
        String code;
        do {
            code = generateRandomCode();
        } while (spaceRepository.existsByTeamCode(code));
        return code;
    }

    private String generateRandomCode() {
        StringBuilder sb = new StringBuilder(TEAM_CODE_LENGTH);
        for (int i = 0; i < TEAM_CODE_LENGTH; i++) {
            sb.append(TEAM_CODE_CHARS.charAt(RANDOM.nextInt(TEAM_CODE_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * [비동기 로직] GitHub Git Trees API 및 Commits API를 호출하여 데이터를 로드합니다.
     */
    @Async
    public void loadGithubCommitsAsync(Long spaceId, String repoUrl) {
        log.info("비동기 데이터 로드 시작 - SpaceID: {}, Repo: {}", spaceId, repoUrl);
        try {
            String urlPath = repoUrl.replace("https://github.com/", "").replace(".git", "");
            String[] parts = urlPath.split("/");
            if (parts.length < 2) {
                log.error("잘못된 레포지토리 URL 형식입니다: {}", repoUrl);
                return;
            }
            String owner = parts[0];
            String repo = parts[1];

            JsonNode commits = githubFileFetchService.fetchCommits(owner, repo);
            String latestCommitSha = "main";
            
            if (commits != null && commits.isArray() && commits.size() > 0) {
                latestCommitSha = commits.get(0).get("sha").asText();
                List<CommitHistory> commitHistories = new ArrayList<>();
                
                for (JsonNode commitNode : commits) {
                    String sha = commitNode.get("sha").asText();
                    String message = commitNode.get("commit").get("message").asText();
                    String author = commitNode.get("commit").get("author").get("name").asText();
                    String dateStr = commitNode.get("commit").get("author").get("date").asText();
                    
                    CommitHistory history = CommitHistory.builder()
                            .spaceId(spaceId)
                            .repoName(repo)
                            .commitSha(sha)
                            .message(message)
                            .commitDate(dateStr)
                            .author(author)
                            .build();
                            
                    commitHistories.add(history);
                }
                commitHistoryRepository.saveAll(commitHistories);
                log.info("최근 100개의 커밋 내역 저장 완료");
            }

            JsonNode treeResponse = githubFileFetchService.fetchGitTree(owner, repo, latestCommitSha);
            if (treeResponse != null && treeResponse.has("tree")) {
                JsonNode treeArray = treeResponse.get("tree");
                List<GithubFileInfo> fileInfos = new ArrayList<>();
                
                for (JsonNode node : treeArray) {
                    if ("blob".equals(node.get("type").asText())) {
                        String path = node.get("path").asText();
                        String fileName = path.contains("/") ? path.substring(path.lastIndexOf('/') + 1) : path;
                        
                        GithubFileInfo fileInfo = GithubFileInfo.builder()
                                .repositoryUrl(repoUrl)
                                .filePath(path)
                                .fileName(fileName)
                                .lastCommitHash(latestCommitSha)
                                .lastSyncedAt(LocalDateTime.now())
                                .build();
                                
                        fileInfos.add(fileInfo);
                    }
                }
                githubFileRepository.saveAll(fileInfos);
                log.info("파일 경로 목록 저장 완료. 총 {}개 파일", fileInfos.size());
            }
            log.info("비동기 데이터 로드 완료 - SpaceID: {}", spaceId);

        } catch (Exception e) {
            log.error("비동기 데이터 로드 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}
