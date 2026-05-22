package com.vector.onboarding.domain.functionalview;

import com.vector.onboarding.domain.functionalview.dto.CommitSummaryDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalElementSaveRequestDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalViewResponseDto;
import com.vector.onboarding.domain.space.SpaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Functional View API 컨트롤러.
 *
 * GET  /api/spaces/{spaceId}/functional-view                          → 프론트엔드용 React Flow 데이터 조회
 * GET  /api/spaces/{spaceId}/functional-elements/{elementId}/commits  → 노드 클릭 시 파일별 커밋 히스토리 조회
 * POST /api/spaces/{spaceId}/functional-elements                      → AI 파이프라인 분석 결과 적재
 */
@RestController
@RequestMapping("/api/spaces/{spaceId}")
@RequiredArgsConstructor
public class FunctionalViewController {

    private final FunctionalViewService functionalViewService;
    private final FunctionalElementAdminService functionalElementAdminService;
    private final SpaceService spaceService;

    /**
     * 특정 스페이스의 Functional View 데이터를 React Flow 규격으로 반환합니다.
     * JWT 인증 + 스페이스 멤버십 검증 필요.
     * 비멤버가 spaceId를 조작하여 접근 시도 시 403 반환.
     *
     * @param spaceId 조회할 스페이스 ID
     * @return { nodes: [...], edges: [...] }
     */
    @GetMapping("/functional-view")
    public ResponseEntity<FunctionalViewResponseDto> getFunctionalView(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.checkSpaceMembership(requestUserId, spaceId);

        FunctionalViewResponseDto response = functionalViewService.getFunctionalView(spaceId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 노드(FunctionalElement)와 연관된 커밋 히스토리를 반환합니다.
     * 프론트엔드에서 노드를 클릭했을 때 호출됩니다.
     *
     * <p>동작: GitHub API의 {@code ?path=} 파라미터로 해당 파일만 수정한 커밋을 필터링합니다.
     * 결과는 서버 메모리에 10분간 캐싱되므로 동일 노드 재클릭 시 API 재호출이 발생하지 않습니다.
     *
     * <p>FOREST 노드처럼 filePath가 없는 경우 빈 배열을 반환합니다.
     *
     * @param spaceId   멤버십 검증용 스페이스 ID
     * @param elementId 커밋 히스토리를 조회할 노드 ID
     * @return 해당 파일을 수정한 커밋 목록 (최대 30개)
     */
    @GetMapping("/functional-elements/{elementId}/commits")
    public ResponseEntity<List<CommitSummaryDto>> getCommitsForElement(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long spaceId,
            @PathVariable Long elementId) {

        Long requestUserId = Long.valueOf(userDetails.getUsername());
        spaceService.checkSpaceMembership(requestUserId, spaceId);

        List<CommitSummaryDto> commits = functionalViewService.getCommitsForElement(spaceId, elementId);
        return ResponseEntity.ok(commits);
    }

    /**
     * AI 파이프라인이 분석 완료 후 기능 요소 데이터를 적재합니다.
     * 기존 데이터를 전체 교체합니다 (재분석 지원).
     *
     * @param spaceId  대상 스페이스 ID
     * @param requests AI가 분석한 FunctionalElement 리스트
     */
    @PostMapping("/functional-elements")
    public ResponseEntity<Void> saveFunctionalElements(
            @PathVariable Long spaceId,
            @RequestBody List<FunctionalElementSaveRequestDto> requests) {
        functionalElementAdminService.replaceAll(spaceId, requests);
        return ResponseEntity.ok().build();
    }
}

