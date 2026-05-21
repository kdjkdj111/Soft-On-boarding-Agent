package com.vector.onboarding.domain.functionalview;

import com.vector.onboarding.domain.functionalview.dto.FunctionalElementSaveRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI 파이프라인의 분석 결과를 수신하여 DB에 저장하는 서비스.
 * 재분석 시 기존 데이터를 전체 교체(Replace)합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FunctionalElementAdminService {

    private final FunctionalElementRepository functionalElementRepository;

    /**
     * 특정 스페이스의 기능 요소 데이터를 전체 교체합니다.
     * AI 파이프라인이 재분석 완료 후 이 메서드를 통해 데이터를 갱신합니다.
     *
     * @param spaceId  저장 대상 스페이스 ID
     * @param requests AI가 분석한 FunctionalElement 리스트
     */
    @Transactional
    public void replaceAll(Long spaceId, List<FunctionalElementSaveRequestDto> requests) {
        log.info("spaceId={}의 FunctionalElement 데이터를 교체합니다. 신규 데이터 {} 건.", spaceId, requests.size());

        // 1. 기존 데이터 전체 삭제 (재분석 덮어쓰기)
        functionalElementRepository.deleteBySpaceId(spaceId);

        // 2. 신규 데이터 일괄 저장
        List<FunctionalElement> elements = requests.stream()
                .map(dto -> FunctionalElement.builder()
                        .spaceId(spaceId)
                        .parentId(dto.getParentId())
                        .name(dto.getName())
                        .elementType(dto.getElementType())
                        .description(dto.getDescription())
                        .filePath(dto.getFilePath())
                        .apiMethod(dto.getApiMethod())
                        .apiUrl(dto.getApiUrl())
                        .build())
                .collect(Collectors.toList());

        functionalElementRepository.saveAll(elements);
        log.info("spaceId={}의 FunctionalElement {} 건 저장 완료.", spaceId, elements.size());
    }
}
