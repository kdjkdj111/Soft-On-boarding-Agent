package com.vector.onboarding.domain.functionalview;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Functional View의 핵심 엔티티.
 * AI 파이프라인이 GitHub 레포를 분석한 결과를 저장합니다.
 *
 * 계층 구조: FOREST (도메인) → TREE (클래스) → RING (메서드/엔드포인트)
 * parentId를 통한 Self-referencing으로 계층을 표현합니다.
 */
@Entity
@Table(
    name = "functional_elements",
    indexes = {
        @Index(name = "idx_functional_elements_space_id", columnList = "space_id")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class FunctionalElement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 팀 스페이스 소속인지 (spaces.id 참조) */
    @Column(name = "space_id", nullable = false)
    private Long spaceId;

    /**
     * 부모 노드 ID (Self-referencing).
     * FOREST 타입은 null, TREE/RING 타입은 반드시 부모를 가집니다.
     */
    @Column(name = "parent_id")
    private Long parentId;

    /** 노드 이름 (예: "SpaceService", "createSpace", "인증 도메인") */
    @Column(nullable = false)
    private String name;

    /** 노드 계층 타입 (FOREST / TREE / RING) */
    @Enumerated(EnumType.STRING)
    @Column(name = "element_type", nullable = false, length = 10)
    private ElementType elementType;

    /** AI가 요약한 로직 해설 */
    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    /** 실제 GitHub 소스코드 경로 (예: src/main/java/.../SpaceService.java) */
    @Column(name = "file_path")
    private String filePath;

    /** HTTP 메서드 (RING 타입 중 엔드포인트인 경우. 예: "POST", "GET") */
    @Column(name = "api_method", length = 10)
    private String apiMethod;

    /** HTTP URL 경로 (RING 타입 중 엔드포인트인 경우. 예: "/api/spaces") */
    @Column(name = "api_url")
    private String apiUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public FunctionalElement(Long spaceId, Long parentId, String name,
                             ElementType elementType, String description,
                             String filePath, String apiMethod, String apiUrl) {
        this.spaceId = spaceId;
        this.parentId = parentId;
        this.name = name;
        this.elementType = elementType;
        this.description = description;
        this.filePath = filePath;
        this.apiMethod = apiMethod;
        this.apiUrl = apiUrl;
    }
}
