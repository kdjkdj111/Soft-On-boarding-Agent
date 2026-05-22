package com.vector.onboarding.domain.flowview.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.vector.onboarding.domain.flowview.entity.BoardTask;
import com.vector.onboarding.domain.flowview.entity.BoardTaskStatus;

public interface BoardTaskRepository extends JpaRepository<BoardTask, Long> {
    List<BoardTask> findBySpaceId(Long spaceId);
    List<BoardTask> findBySpaceIdAndStatus(Long spaceId, BoardTaskStatus status);
}
