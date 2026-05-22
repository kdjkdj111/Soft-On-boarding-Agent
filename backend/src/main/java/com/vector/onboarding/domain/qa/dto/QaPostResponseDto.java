package com.vector.onboarding.domain.qa.dto;

import com.vector.onboarding.domain.qa.QaPost;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QaPostResponseDto {
    private Long id;
    private String title;
    private String authorName;
    private String authorProfileImage;
    private LocalDateTime createdAt;
    private int commentCount;

    public static QaPostResponseDto from(QaPost post) {
        return QaPostResponseDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .authorName(post.getAuthor().getUsername())
                .authorProfileImage(post.getAuthor().getProfileImageUrl())
                .createdAt(post.getCreatedAt())
                .commentCount(post.getComments() != null ? post.getComments().size() : 0)
                .build();
    }
}
