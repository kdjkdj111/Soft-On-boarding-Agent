package com.vector.onboarding.domain.functionalview.dto;

import com.vector.onboarding.domain.functionalview.ElementType;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * AI 파이프라인이 분석 완료 후 백엔드로 전송하는 기능 요소 저장 요청 DTO.
 *
 * 요청 예시:
 * POST /api/spaces/{spaceId}/functional-elements
 * Body: [
 *   { "name": "인증 도메인", "elementType": "FOREST", "parentId": null, "description": "..." },
 *   { "name": "AuthService", "elementType": "TREE", "parentId": 1, "filePath": "src/...", "description": "..." },
 *   { "name": "login()", "elementType": "RING", "parentId": 2, "apiMethod": "POST", "apiUrl": "/api/auth/login" }
 * ]
 */
@Getter
@NoArgsConstructor
public class FunctionalElementSaveRequestDto {

    /** 노드 이름 (필수) */
    private String name;

    /** 노드 계층 타입 (필수): FOREST / TREE / RING */
    private ElementType elementType;

    /**
     * 부모 노드의 DB id (선택).
     * FOREST 타입은 null, TREE/RING은 반드시 부모 id를 넣어야 합니다.
     */
    private Long parentId;

    /** AI가 요약한 로직 설명 (선택) */
    private String description;

    /** 소스 파일 경로 (선택, TREE/RING에서 사용) */
    private String filePath;

    /** HTTP 메서드 (선택, RING 엔드포인트만: "POST", "GET" 등) */
    private String apiMethod;

    /** HTTP URL 경로 (선택, RING 엔드포인트만: "/api/spaces" 등) */
    private String apiUrl;
}
