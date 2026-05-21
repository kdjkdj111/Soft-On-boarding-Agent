package com.vector.onboarding.domain.functionalview;

/**
 * Functional View의 노드 계층 타입.
 * - FOREST: 최상위 도메인 그룹 (예: 인증 도메인, 스페이스 관리)
 * - TREE:   실제 클래스 / 서비스 단위 (예: SpaceService, AuthController)
 * - RING:   핵심 메서드 / HTTP 엔드포인트 (예: createSpace(), POST /api/spaces)
 */
public enum ElementType {
    FOREST,
    TREE,
    RING
}
