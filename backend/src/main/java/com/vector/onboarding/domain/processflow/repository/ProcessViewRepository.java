package com.vector.onboarding.domain.processflow.repository;

import com.vector.onboarding.domain.processflow.entity.ProcessView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProcessViewRepository extends JpaRepository<ProcessView, Long> {
    List<ProcessView> findBySpaceId(Long spaceId);
    void deleteBySpaceId(Long spaceId);
}
