package com.vector.onboarding.domain.dataview.service;

import com.vector.onboarding.domain.dataview.dto.InterfaceViewResponseDto;
import com.vector.onboarding.domain.dataview.repository.InterfaceViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterfaceViewService {

    private final InterfaceViewRepository interfaceViewRepository;

    public List<InterfaceViewResponseDto> getInterfaceViewBySpaceId(Long spaceId) {
        return interfaceViewRepository.findAllBySpaceId(spaceId).stream()
                .map(InterfaceViewResponseDto::from)
                .collect(Collectors.toList());
    }
}
