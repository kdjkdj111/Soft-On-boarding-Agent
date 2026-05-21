package com.vector.onboarding.domain.space;

import com.vector.onboarding.domain.space.dto.CreateSpaceRequestDto;
import com.vector.onboarding.domain.space.dto.CreateSpaceResponseDto;
import com.vector.onboarding.domain.space.dto.JoinSpaceRequestDto;
import com.vector.onboarding.domain.space.dto.MemberResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    /**
     * 팀 스페이스를 생성합니다.
     * POST /api/spaces
     */
    @PostMapping
    public ResponseEntity<CreateSpaceResponseDto> createSpace(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateSpaceRequestDto request) {

        Long userId = Long.valueOf(userDetails.getUsername());
        CreateSpaceResponseDto response = spaceService.createSpace(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 팀 코드로 팀 스페이스에 참여합니다.
     * POST /api/spaces/join
     */
    @PostMapping("/join")
    public ResponseEntity<Void> joinSpace(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JoinSpaceRequestDto request) {

        Long userId = Long.valueOf(userDetails.getUsername());
        spaceService.joinSpace(userId, request.getTeamCode(), request.getJobRole());
        return ResponseEntity.ok().build();
    }

    /**
     * 팀에서 탈퇴합니다.
     * POST /api/spaces/leave
     */
    @PostMapping("/leave")
    public ResponseEntity<Void> leaveSpace(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long userId = Long.valueOf(userDetails.getUsername());
        spaceService.leaveSpace(userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 특정 스페이스의 전체 팀원 목록을 조회합니다.
     * GET /api/spaces/{spaceId}/members
     * 멤버만 접근 가능 (비멤버 → 403)
     */
    @GetMapping("/{spaceId}/members")
    public ResponseEntity<List<MemberResponseDto>> getMembers(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        List<MemberResponseDto> members = spaceService.getMembers(requestUserId, spaceId);
        return ResponseEntity.ok(members);
    }

    /**
     * 대상 유저에게 ADMIN 권한을 부여합니다.
     * PATCH /api/spaces/{spaceId}/members/{userId}/assign-admin
     * ADMIN만 접근 가능 (비ADMIN → 403)
     */
    @PatchMapping("/{spaceId}/members/{userId}/assign-admin")
    public ResponseEntity<Void> assignAdmin(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId,
            @PathVariable Long userId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.assignAdmin(requestUserId, spaceId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 대상 유저를 팀에서 추방합니다.
     * DELETE /api/spaces/{spaceId}/members/{userId}/kick
     * ADMIN만 접근 가능 / 본인·마지막ADMIN 추방 불가 → 400
     */
    @DeleteMapping("/{spaceId}/members/{userId}/kick")
    public ResponseEntity<Void> kickMember(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId,
            @PathVariable Long userId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.kickMember(requestUserId, spaceId, userId);
        return ResponseEntity.noContent().build();
    }
}
