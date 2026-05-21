package com.vector.onboarding.domain.functionalview;

import com.vector.onboarding.domain.functionalview.dto.FunctionalElementSaveRequestDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalViewResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Functional View API 컨트롤러.
 *
 * GET  /api/spaces/{spaceId}/functional-view      → 프론트엔드용 React Flow 데이터 조회
 * POST /api/spaces/{spaceId}/functional-elements  → AI 파이프라인 분석 결과 적재
 */
@RestController
@RequestMapping("/api/spaces/{spaceId}")
@RequiredArgsConstructor
public class FunctionalViewController {

    private final FunctionalViewService functionalViewService;
    private final FunctionalElementAdminService functionalElementAdminService;

    /**
     * 특정 스페이스의 Functional View 데이터를 React Flow 규격으로 반환합니다.
     * 프론트엔드가 호출합니다. JWT 인증 필요.
     *
     * @param spaceId 조회할 스페이스 ID
     * @return { nodes: [...], edges: [...] }
     */
    @GetMapping("/functional-view")
    public ResponseEntity<FunctionalViewResponseDto> getFunctionalView(@PathVariable Long spaceId) {
        FunctionalViewResponseDto response = functionalViewService.getFunctionalView(spaceId);
        return ResponseEntity.ok(response);
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
