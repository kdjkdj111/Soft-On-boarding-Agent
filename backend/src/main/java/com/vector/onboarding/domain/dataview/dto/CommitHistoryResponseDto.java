package com.vector.onboarding.domain.dataview.dto;

import com.vector.onboarding.domain.dataview.entity.CommitHistory;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CommitHistoryResponseDto {
    private Long id;
    private String commitSha;
    private String message;
    private String commitDate;
    private String author;

    public static CommitHistoryResponseDto from(CommitHistory entity) {
        return CommitHistoryResponseDto.builder()
                .id(entity.getId())
                .commitSha(entity.getCommitSha())
                .message(entity.getMessage())
                .commitDate(entity.getCommitDate())
                .author(entity.getAuthor())
                .build();
    }
}
