package com.vector.onboarding.domain.functionalview.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

/**
 * 노드별 커밋 히스토리 응답 DTO.
 * GET /api/spaces/{spaceId}/functional-elements/{elementId}/commits 에서 반환됩니다.
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CommitSummaryDto {

    /** 커밋 SHA (7자리 short) */
    private String sha;

    /** 커밋 메시지 (첫 줄만) */
    private String message;

    /** 커밋 작성자 이름 */
    private String author;

    /** 커밋 날짜 (ISO 8601 형식: 예, "2024-05-18T09:30:00Z") */
    private String date;

    /** 커밋 URL (GitHub 페이지 링크) */
    private String url;
}
