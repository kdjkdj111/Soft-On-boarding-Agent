package com.vector.onboarding.domain.dataview.repository;

import com.vector.onboarding.domain.dataview.entity.ComponentNode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComponentNodeRepository extends JpaRepository<ComponentNode, Long> {
    List<ComponentNode> findByRepoNameAndCategory(String repoName, String category);
}
