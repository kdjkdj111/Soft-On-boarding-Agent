package com.vector.onboarding.domain.dataview.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "\"Process\"")
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "process_json", columnDefinition = "jsonb")
    private Object processJson;
}
