package com.vector.onboarding.domain.dataview;

import com.vector.onboarding.domain.dataview.dto.InterfaceViewResponseDto;
import com.vector.onboarding.domain.dataview.service.InterfaceViewService;
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
@RequestMapping("/api/spaces/{spaceId}/interface-view")
@RequiredArgsConstructor
public class InterfaceViewController {

    private final InterfaceViewService interfaceViewService;
    private final SpaceService spaceService;

    @GetMapping
    public ResponseEntity<List<InterfaceViewResponseDto>> getInterfaceView(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.checkSpaceMembership(requestUserId, spaceId);

        List<InterfaceViewResponseDto> response = interfaceViewService.getInterfaceViewBySpaceId(spaceId);
        return ResponseEntity.ok(response);
    }
}
