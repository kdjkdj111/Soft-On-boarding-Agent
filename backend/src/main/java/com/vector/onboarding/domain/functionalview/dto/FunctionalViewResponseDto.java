package com.vector.onboarding.domain.functionalview.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Functional View API 최종 응답 DTO.
 * React Flow가 바로 사용할 수 있는 nodes + edges 구조입니다.
 */
@Getter
@Builder
public class FunctionalViewResponseDto {

    private List<FunctionalViewNodeDto> nodes;
    private List<FunctionalViewEdgeDto> edges;
}
