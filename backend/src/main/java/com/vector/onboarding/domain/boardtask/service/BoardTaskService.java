package com.vector.onboarding.domain.boardtask.service;

import com.vector.onboarding.domain.boardtask.dto.CreateBoardTaskRequestDto;
import com.vector.onboarding.domain.boardtask.entity.BoardTask;
import com.vector.onboarding.domain.boardtask.entity.BoardTaskStatus;
import com.vector.onboarding.domain.boardtask.repository.BoardTaskRepository;
import com.vector.onboarding.domain.space.Space;
import com.vector.onboarding.domain.space.SpaceRepository;
import com.vector.onboarding.global.exception.SpaceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardTaskService {

    private final BoardTaskRepository boardTaskRepository;
    private final SpaceRepository spaceRepository;

    /**
     * 특정 스페이스에 새 태스크를 생성합니다.
     */
    public BoardTask createTask(String teamCode, CreateBoardTaskRequestDto dto) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));

        BoardTask task = BoardTask.builder()
                .spaceId(space.getId())
                .title(dto.getTitle())
                .status(dto.getStatus() != null ? dto.getStatus() : BoardTaskStatus.TODO)
                .assignee(dto.getAssignee())
                .label(dto.getLabel())
                .build();

        return boardTaskRepository.save(task);
    }

    /**
     * 특정 팀 코드의 모든 태스크를 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<BoardTask> getTasksByTeamCode(String teamCode) {
        Space space = spaceRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new SpaceNotFoundException(teamCode));
        return boardTaskRepository.findBySpaceId(space.getId());
    }

    /**
     * 특정 Space ID의 모든 태스크를 조회합니다. (Dashboard 내부 호출용)
     */
    @Transactional(readOnly = true)
    public List<BoardTask> getTasksBySpaceId(Long spaceId) {
        return boardTaskRepository.findBySpaceId(spaceId);
    }

    /**
     * 태스크 전체 필드를 수정합니다.
     */
    public BoardTask updateTask(Long taskId, CreateBoardTaskRequestDto dto) {
        BoardTask task = boardTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.update(dto.getTitle(), dto.getStatus(), dto.getAssignee(), dto.getLabel());
        return task; // dirty checking으로 자동 반영
    }

    /**
     * 태스크 상태만 변경합니다.
     */
    public BoardTask updateTaskStatus(Long taskId, BoardTaskStatus newStatus) {
        BoardTask task = boardTaskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
        task.update(null, newStatus, null, null);
        return task;
    }

    /**
     * 태스크를 삭제합니다.
     */
    public void deleteTask(Long taskId) {
        if (!boardTaskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found: " + taskId);
        }
        boardTaskRepository.deleteById(taskId);
    }
}
