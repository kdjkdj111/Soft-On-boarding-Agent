package com.vector.onboarding.domain.webhook.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vector.onboarding.domain.dataview.entity.DataView;
import com.vector.onboarding.domain.interfaceview.entity.InterfaceView;
import com.vector.onboarding.domain.processflow.entity.ProcessView;
import lombok.Data;

import java.time.LocalDateTime;

public class WebhookDtos {

    @Data
    public static class InterfaceViewPayload {
        @JsonProperty("space_id")
        private Long spaceId;
        @JsonProperty("repo_name")
        private String repoName;
        @JsonProperty("file_path")
        private String filePath;
        @JsonProperty("element_type")
        private String elementType;
        private String name;
        private String description;
        @JsonProperty("extra_info")
        private String extraInfo;
        @JsonProperty("created_at")
        private LocalDateTime createdAt;

        public InterfaceView toEntity() {
            return InterfaceView.builder()
                    .spaceId(spaceId)
                    .repoName(repoName)
                    .filePath(filePath)
                    .elementType(elementType)
                    .name(name)
                    .description(description)
                    .extraInfo(extraInfo)
                    .createdAt(createdAt)
                    .build();
        }
    }

    @Data
    public static class DataViewPayload {
        @JsonProperty("space_id")
        private Long spaceId;
        @JsonProperty("repo_name")
        private String repoName;
        @JsonProperty("file_path")
        private String filePath;
        @JsonProperty("file_name")
        private String fileName;
        @JsonProperty("created_at")
        private LocalDateTime createdAt;

        public DataView toEntity() {
            return DataView.builder()
                    .spaceId(spaceId)
                    .repoName(repoName)
                    .filePath(filePath)
                    .fileName(fileName)
                    .createdAt(createdAt)
                    .build();
        }
    }

    @Data
    public static class ProcessViewPayload {
        @JsonProperty("space_id")
        private Long spaceId;
        @JsonProperty("repo_name")
        private String repoName;
        @JsonProperty("file_path")
        private String filePath;
        @JsonProperty("element_type")
        private String elementType;
        private String name;
        private String description;
        @JsonProperty("tech_stack")
        private String techStack;
        @JsonProperty("env_vars")
        private String envVars;
        @JsonProperty("created_at")
        private LocalDateTime createdAt;

        public ProcessView toEntity() {
            return ProcessView.builder()
                    .spaceId(spaceId)
                    .repoName(repoName)
                    .filePath(filePath)
                    .elementType(elementType)
                    .name(name)
                    .description(description)
                    .techStack(techStack)
                    .envVars(envVars)
                    .createdAt(createdAt)
                    .build();
        }
    }
}
