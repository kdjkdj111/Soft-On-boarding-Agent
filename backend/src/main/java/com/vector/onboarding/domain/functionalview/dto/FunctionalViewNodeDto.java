package com.vector.onboarding.domain.functionalview.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.Map;

/**
 * React Flow의 노드(node) 규격 DTO.
 * null 필드는 JSON 응답에서 제외됩니다.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FunctionalViewNodeDto {

    /** React Flow 노드 고유 ID (예: "1", "2") */
    private String id;

    /**
     * React Flow 노드 타입.
     * FOREST → "forestNode", TREE → "treeNode", RING → "ringNode"
     */
    private String type;

    /** 부모 노드 ID (FOREST 타입은 null) */
    private String parentId;

    /** 노드에 담길 데이터 (label, description, filePath 등) */
    private Map<String, Object> data;

    /**
     * React Flow 렌더링에 필요한 position 기본값.
     * 실제 레이아웃은 React Flow의 dagre/elk 자동 배치를 사용합니다.
     */
    @Builder.Default
    private Position position = new Position(0, 0);

    @Getter
    @Builder
    public static class Position {
        private int x;
        private int y;

        public Position(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }
}
