package com.vector.onboarding.domain.functionalview.dto;

import lombok.Builder;
import lombok.Getter;

/**
 * React Flow의 엣지(edge) 규격 DTO.
 * parentId가 있는 노드들을 기반으로 자동 생성됩니다.
 */
@Getter
@Builder
public class FunctionalViewEdgeDto {

    /** 엣지 고유 ID (예: "e-1-2") */
    private String id;

    /** 시작 노드 ID */
    private String source;

    /** 끝 노드 ID */
    private String target;

    /** 엣지 애니메이션 여부 */
    @Builder.Default
    private boolean animated = true;
}
