package com.vector.onboarding.domain.boardtask.repository;

import com.vector.onboarding.domain.boardtask.entity.BoardTask;
import com.vector.onboarding.domain.boardtask.entity.BoardTaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardTaskRepository extends JpaRepository<BoardTask, Long> {
    List<BoardTask> findBySpaceId(Long spaceId);
    List<BoardTask> findBySpaceIdAndStatus(Long spaceId, BoardTaskStatus status);
}

