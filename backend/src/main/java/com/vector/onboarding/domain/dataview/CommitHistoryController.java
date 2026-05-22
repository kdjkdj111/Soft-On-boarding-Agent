package com.vector.onboarding.domain.dataview;

import com.vector.onboarding.domain.dataview.dto.CommitHistoryResponseDto;
import com.vector.onboarding.domain.dataview.service.CommitHistoryService;
import com.vector.onboarding.domain.space.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/spaces/{spaceId}/commit-history")
@RequiredArgsConstructor
public class CommitHistoryController {

    private final CommitHistoryService commitHistoryService;
    private final SpaceService spaceService;

    @GetMapping
    public ResponseEntity<List<CommitHistoryResponseDto>> getCommitHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.checkSpaceMembership(requestUserId, spaceId);

        List<CommitHistoryResponseDto> response = commitHistoryService.getCommitHistoryBySpaceId(spaceId);
        return ResponseEntity.ok(response);
    }
}
