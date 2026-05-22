package com.vector.onboarding.domain.qa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QaCommentRequestDto {
    @NotBlank
    private String content;
}
