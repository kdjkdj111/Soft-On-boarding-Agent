package com.vector.onboarding.domain.processflow.dto;

import com.vector.onboarding.domain.processflow.entity.ProcessView;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessViewResponseDto {
    private Long id;
    private String repoName;
    private String filePath;
    private String elementType;
    private String name;
    private String description;
    private String techStack;
    private String envVars;
    private LocalDateTime createdAt;

    public static ProcessViewResponseDto from(ProcessView entity) {
        return ProcessViewResponseDto.builder()
                .id(entity.getId())
                .repoName(entity.getRepoName())
                .filePath(entity.getFilePath())
                .elementType(entity.getElementType())
                .name(entity.getName())
                .description(entity.getDescription())
                .techStack(entity.getTechStack())
                .envVars(entity.getEnvVars())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
