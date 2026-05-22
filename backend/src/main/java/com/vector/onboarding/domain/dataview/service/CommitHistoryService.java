package com.vector.onboarding.domain.dataview.service;

import com.vector.onboarding.domain.dataview.dto.CommitHistoryResponseDto;
import com.vector.onboarding.domain.dataview.repository.CommitHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommitHistoryService {

    private final CommitHistoryRepository commitHistoryRepository;

    public List<CommitHistoryResponseDto> getCommitHistoryBySpaceId(Long spaceId) {
        return commitHistoryRepository.findBySpaceIdOrderByIdDesc(spaceId).stream()
                .map(CommitHistoryResponseDto::from)
                .collect(Collectors.toList());
    }
}
