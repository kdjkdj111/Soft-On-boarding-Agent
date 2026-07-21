package com.vector.onboarding.domain.dashboardview.dto;

import com.vector.onboarding.domain.boardtask.dto.BoardTaskResponseDto;
import com.vector.onboarding.domain.commit.dto.CommitHistoryResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponseDto {
    private List<BoardTaskResponseDto> tasks;
    private List<CommitHistoryResponseDto> commits;
}
