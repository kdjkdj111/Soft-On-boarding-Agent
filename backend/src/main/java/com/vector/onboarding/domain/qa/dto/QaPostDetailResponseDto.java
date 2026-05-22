package com.vector.onboarding.domain.qa.dto;

import com.vector.onboarding.domain.qa.QaPost;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
public class QaPostDetailResponseDto {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorName;
    private String authorProfileImage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<QaCommentResponseDto> comments;

    public static QaPostDetailResponseDto from(QaPost post) {
        return QaPostDetailResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorId(post.getAuthor().getId())
                .authorName(post.getAuthor().getUsername())
                .authorProfileImage(post.getAuthor().getProfileImageUrl())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .comments(post.getComments() != null ? post.getComments().stream()
                        .map(QaCommentResponseDto::from)
                        .collect(Collectors.toList()) : java.util.Collections.emptyList())
                .build();
    }
}
