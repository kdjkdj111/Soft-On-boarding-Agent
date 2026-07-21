package com.vector.onboarding.domain.processflow;

import com.vector.onboarding.domain.processflow.dto.ProcessViewResponseDto;
import com.vector.onboarding.domain.processflow.service.ProcessViewService;
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
@RequestMapping("/api/spaces/{spaceId}/process-view")
@RequiredArgsConstructor
public class ProcessViewController {

    private final ProcessViewService processViewService;
    private final SpaceService spaceService;

    @GetMapping
    public ResponseEntity<List<ProcessViewResponseDto>> getProcessView(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.checkSpaceMembership(requestUserId, spaceId);

        List<ProcessViewResponseDto> response = processViewService.getProcessViewBySpaceId(spaceId);
        return ResponseEntity.ok(response);
    }
}
