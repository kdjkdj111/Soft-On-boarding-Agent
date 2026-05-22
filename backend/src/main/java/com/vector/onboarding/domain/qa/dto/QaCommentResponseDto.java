package com.vector.onboarding.domain.qa.dto;

import com.vector.onboarding.domain.qa.QaComment;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QaCommentResponseDto {
    private Long id;
    private Long postId;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorProfileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static QaCommentResponseDto from(QaComment comment) {
        return QaCommentResponseDto.builder()
                .id(comment.getId())
                .postId(comment.getPost().getId())
                .content(comment.getContent())
                .authorId(comment.getAuthor().getId())
                .authorName(comment.getAuthor().getUsername())
                .authorProfileImage(comment.getAuthor().getProfileImageUrl())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
