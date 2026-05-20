package com.vector.onboarding.domain.dataview.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "\"ComponentNodes\"")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ComponentNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "repo_name", nullable = false)
    private String repoName;

    @Column(name = "category")
    private String category;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
