package com.vector.onboarding.domain.flowview.controller;

import com.vector.onboarding.domain.flowview.dto.BoardTaskResponseDto;
import com.vector.onboarding.domain.flowview.dto.CommitHistoryResponseDto;
import com.vector.onboarding.domain.flowview.dto.CreateBoardTaskRequestDto;
import com.vector.onboarding.domain.flowview.dto.UpdateTaskStatusRequestDto;
import com.vector.onboarding.domain.flowview.entity.BoardTask;
import com.vector.onboarding.domain.flowview.service.FlowViewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/spaces")
@RequiredArgsConstructor
public class FlowViewController {

    private final FlowViewService flowViewService;

    // =====================================================================
    // Commit History
    // =====================================================================

    /**
     * 특정 팀 코드의 GitHub 커밋 내역을 가져옵니다.
     * GET /api/spaces/{teamCode}/commits
     */
    @GetMapping("/{teamCode}/commits")
    public ResponseEntity<List<CommitHistoryResponseDto>> getCommits(
            @PathVariable String teamCode) {

        List<CommitHistoryResponseDto> response = flowViewService.getCommitsByTeamCode(teamCode)
                .stream()
                .map(CommitHistoryResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * 특정 팀 코드의 커밋을 강제 재동기화합니다.
     * POST /api/spaces/{teamCode}/commits/sync
     */
    @PostMapping("/{teamCode}/commits/sync")
    public ResponseEntity<List<CommitHistoryResponseDto>> syncCommits(
            @PathVariable String teamCode) {

        List<CommitHistoryResponseDto> response = flowViewService.syncCommitsByTeamCode(teamCode)
                .stream()
                .map(CommitHistoryResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // =====================================================================
    // BoardTask CRUD  (/api/spaces/{teamCode}/tasks)
    // =====================================================================

    /**
     * 새 태스크를 생성합니다.
     * POST /api/spaces/{teamCode}/tasks
     */
    @PostMapping("/{teamCode}/tasks")
    public ResponseEntity<BoardTaskResponseDto> createTask(
            @PathVariable String teamCode,
            @Valid @RequestBody CreateBoardTaskRequestDto request) {

        BoardTask task = flowViewService.createTask(teamCode, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(BoardTaskResponseDto.from(task));
    }

    /**
     * 특정 팀의 모든 태스크를 조회합니다.
     * GET /api/spaces/{teamCode}/tasks
     */
    @GetMapping("/{teamCode}/tasks")
    public ResponseEntity<List<BoardTaskResponseDto>> getTasks(
            @PathVariable String teamCode) {

        List<BoardTaskResponseDto> response = flowViewService.getTasksByTeamCode(teamCode)
                .stream()
                .map(BoardTaskResponseDto::from)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    /**
     * 태스크를 수정합니다.
     * PUT /api/spaces/tasks/{taskId}
     */
    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<BoardTaskResponseDto> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody CreateBoardTaskRequestDto request) {

        BoardTask updated = flowViewService.updateTask(taskId, request);
        return ResponseEntity.ok(BoardTaskResponseDto.from(updated));
    }

    /**
     * 태스크 상태만 변경합니다.
     * PATCH /api/spaces/{teamCode}/tasks/{taskId}/status
     */
    @PatchMapping("/{teamCode}/tasks/{taskId}/status")
    public ResponseEntity<BoardTaskResponseDto> updateTaskStatus(
            @PathVariable String teamCode,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskStatusRequestDto request) {

        BoardTask updated = flowViewService.updateTaskStatus(taskId, request.getStatus());
        return ResponseEntity.ok(BoardTaskResponseDto.from(updated));
    }

    /**
     * 태스크를 삭제합니다.
     * DELETE /api/spaces/tasks/{taskId}
     */
    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        flowViewService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
