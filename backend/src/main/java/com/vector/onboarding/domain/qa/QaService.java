package com.vector.onboarding.domain.qa;

import com.vector.onboarding.domain.qa.dto.*;
import com.vector.onboarding.domain.user.User;
import com.vector.onboarding.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QaService {

    private final QaPostRepository qaPostRepository;
    private final QaCommentRepository qaCommentRepository;
    private final UserRepository userRepository;

    public Page<QaPostResponseDto> getPosts(Long spaceId, Pageable pageable) {
        return qaPostRepository.findAllBySpaceIdOrderByCreatedAtDesc(spaceId, pageable)
                .map(QaPostResponseDto::from);
    }

    public QaPostDetailResponseDto getPost(Long id) {
        QaPost post = qaPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));
        return QaPostDetailResponseDto.from(post);
    }

    @Transactional
    public QaPostResponseDto createPost(Long userId, Long spaceId, QaPostRequestDto request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        QaPost post = QaPost.builder()
                .spaceId(spaceId)
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .build();

        return QaPostResponseDto.from(qaPostRepository.save(post));
    }

    @Transactional
    public QaPostDetailResponseDto updatePost(Long userId, Long postId, QaPostRequestDto request) {
        QaPost post = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        post.update(request.getTitle(), request.getContent());
        return QaPostDetailResponseDto.from(post);
    }

    @Transactional
    public void deletePost(Long userId, Long postId) {
        QaPost post = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        qaPostRepository.delete(post);
    }

    @Transactional
    public QaCommentResponseDto createComment(Long userId, Long postId, QaCommentRequestDto request) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        QaPost post = qaPostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        QaComment comment = QaComment.builder()
                .post(post)
                .content(request.getContent())
                .author(author)
                .build();

        return QaCommentResponseDto.from(qaCommentRepository.save(comment));
    }

    @Transactional
    public QaCommentResponseDto updateComment(Long userId, Long commentId, QaCommentRequestDto request) {
        QaComment comment = qaCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("수정 권한이 없습니다.");
        }

        comment.update(request.getContent());
        return QaCommentResponseDto.from(comment);
    }

    @Transactional
    public void deleteComment(Long userId, Long commentId) {
        QaComment comment = qaCommentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다.");
        }

        qaCommentRepository.delete(comment);
    }
}
