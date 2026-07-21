package com.vector.onboarding.domain.processflow.service;

import com.vector.onboarding.domain.processflow.dto.ProcessViewResponseDto;
import com.vector.onboarding.domain.processflow.repository.ProcessViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProcessViewService {

    private final ProcessViewRepository processViewRepository;

    public List<ProcessViewResponseDto> getProcessViewBySpaceId(Long spaceId) {
        return processViewRepository.findBySpaceId(spaceId).stream()
                .map(ProcessViewResponseDto::from)
                .collect(Collectors.toList());
    }
}
