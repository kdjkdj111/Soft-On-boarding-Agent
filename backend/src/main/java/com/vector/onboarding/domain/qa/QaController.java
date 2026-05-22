package com.vector.onboarding.domain.qa;

import com.vector.onboarding.domain.qa.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/qa")
@RequiredArgsConstructor
public class QaController {

    private final QaService qaService;

    @GetMapping("/posts")
    public ResponseEntity<Page<QaPostResponseDto>> getPosts(
            @RequestParam Long spaceId,
            @PageableDefault(size = 15) Pageable pageable) {
        return ResponseEntity.ok(qaService.getPosts(spaceId, pageable));
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<QaPostDetailResponseDto> getPost(@PathVariable Long id) {
        return ResponseEntity.ok(qaService.getPost(id));
    }

    @PostMapping("/posts")
    public ResponseEntity<QaPostResponseDto> createPost(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long spaceId,
            @Valid @RequestBody QaPostRequestDto request) {
        Long userId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(qaService.createPost(userId, spaceId, request));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<QaPostDetailResponseDto> updatePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody QaPostRequestDto request) {
        Long userId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(qaService.updatePost(userId, id, request));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = Long.valueOf(userDetails.getUsername());
        qaService.deletePost(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<QaCommentResponseDto> createComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody QaCommentRequestDto request) {
        Long userId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(qaService.createComment(userId, id, request));
    }

    @PutMapping("/comments/{id}")
    public ResponseEntity<QaCommentResponseDto> updateComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody QaCommentRequestDto request) {
        Long userId = Long.valueOf(userDetails.getUsername());
        return ResponseEntity.ok(qaService.updateComment(userId, id, request));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        Long userId = Long.valueOf(userDetails.getUsername());
        qaService.deleteComment(userId, id);
        return ResponseEntity.noContent().build();
    }
}
