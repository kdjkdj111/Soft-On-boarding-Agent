package com.vector.onboarding.domain.dashboardview;

import com.vector.onboarding.domain.dashboardview.dto.DashboardResponseDto;
import com.vector.onboarding.domain.dashboardview.service.DashboardViewService;
import com.vector.onboarding.domain.space.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/spaces/{spaceId}/dashboard")
@RequiredArgsConstructor
public class DashboardViewController {

    private final DashboardViewService dashboardViewService;
    private final SpaceService spaceService;

    @GetMapping
    public ResponseEntity<DashboardResponseDto> getDashboardView(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.checkSpaceMembership(requestUserId, spaceId);

        DashboardResponseDto response = dashboardViewService.getDashboardViewBySpaceId(spaceId);
        return ResponseEntity.ok(response);
    }
}
