package com.vector.onboarding.domain.dashboardview.service;

import com.vector.onboarding.domain.boardtask.dto.BoardTaskResponseDto;
import com.vector.onboarding.domain.boardtask.service.BoardTaskService;
import com.vector.onboarding.domain.commit.dto.CommitHistoryResponseDto;
import com.vector.onboarding.domain.commit.service.CommitHistoryService;
import com.vector.onboarding.domain.dashboardview.dto.DashboardResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardViewService {

    private final BoardTaskService boardTaskService;
    private final CommitHistoryService commitHistoryService;

    public DashboardResponseDto getDashboardViewBySpaceId(Long spaceId) {
        List<BoardTaskResponseDto> tasks = boardTaskService.getTasksBySpaceId(spaceId).stream()
                .map(BoardTaskResponseDto::from)
                .collect(Collectors.toList());

        List<CommitHistoryResponseDto> commits = commitHistoryService.getCommitHistoryBySpaceId(spaceId);

        return DashboardResponseDto.builder()
                .tasks(tasks)
                .commits(commits)
                .build();
    }
}
