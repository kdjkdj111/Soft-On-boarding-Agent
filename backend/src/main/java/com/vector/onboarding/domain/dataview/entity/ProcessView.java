package com.vector.onboarding.domain.dataview.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "process")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProcessView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "space_id")
    private Long spaceId;

    @Column(name = "repo_name")
    private String repoName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "element_type", length = 50)
    private String elementType;

    @Column(name = "name")
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Lob
    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private String techStack;

    @Lob
    @Column(name = "env_vars", columnDefinition = "TEXT")
    private String envVars;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
