package com.vector.onboarding.domain.qa.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QaPostRequestDto {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
}
