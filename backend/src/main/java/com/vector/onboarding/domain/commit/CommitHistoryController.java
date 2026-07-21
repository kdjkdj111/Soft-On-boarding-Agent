package com.vector.onboarding.domain.commit;

import com.vector.onboarding.domain.commit.dto.CommitHistoryResponseDto;
import com.vector.onboarding.domain.commit.service.CommitHistoryService;
import com.vector.onboarding.domain.space.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class CommitHistoryController {

    private final CommitHistoryService commitHistoryService;
    private final SpaceService spaceService;

    /**
     * 특정 스페이스 ID의 커밋 내역을 가져옵니다.
     * GET /api/spaces/{spaceId}/commit-history
     */
    @GetMapping("/{spaceId}/commit-history")
    public ResponseEntity<List<CommitHistoryResponseDto>> getCommitHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.checkSpaceMembership(requestUserId, spaceId);

        List<CommitHistoryResponseDto> response = commitHistoryService.getCommitHistoryBySpaceId(spaceId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 팀 코드의 GitHub 커밋 내역을 가져옵니다. (온디맨드 동기화 포함)
     * GET /api/spaces/{teamCode}/commits
     */
    @GetMapping("/{teamCode}/commits")
    public ResponseEntity<List<CommitHistoryResponseDto>> getCommits(
            @PathVariable String teamCode) {

        List<CommitHistoryResponseDto> response = commitHistoryService.getCommitsByTeamCode(teamCode)
                .stream()
                .map(CommitHistoryResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * 특정 팀 코드의 커밋을 GitHub에서 강제 재동기화합니다.
     * POST /api/spaces/{teamCode}/commits/sync
     */
    @PostMapping("/{teamCode}/commits/sync")
    public ResponseEntity<List<CommitHistoryResponseDto>> syncCommits(
            @PathVariable String teamCode) {

        List<CommitHistoryResponseDto> response = commitHistoryService.syncCommitsByTeamCode(teamCode)
                .stream()
                .map(CommitHistoryResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
