package com.vector.onboarding.domain.dataview.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.Map;

@Entity
@Table(name = "\"Interface\"")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InterfaceView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "space_id")
    private Long spaceId;

    @Column(name = "repo_name")
    private String repoName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "interface_view_data", columnDefinition = "jsonb")
    private Map<String, Object> interfaceViewData;
}
