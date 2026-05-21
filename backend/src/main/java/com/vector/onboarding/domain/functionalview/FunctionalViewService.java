package com.vector.onboarding.domain.functionalview;

import com.vector.onboarding.domain.functionalview.dto.FunctionalViewEdgeDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalViewNodeDto;
import com.vector.onboarding.domain.functionalview.dto.FunctionalViewResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Functional View 조회 및 React Flow 변환 서비스.
 * DB에서 FunctionalElement를 조회하여 React Flow 규격(nodes + edges)으로 변환합니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FunctionalViewService {

    private final FunctionalElementRepository functionalElementRepository;

    /**
     * 특정 스페이스의 Functional View 데이터를 React Flow 규격으로 반환합니다.
     *
     * @param spaceId 조회할 스페이스 ID
     * @return React Flow nodes + edges 구조
     */
    public FunctionalViewResponseDto getFunctionalView(Long spaceId) {
        List<FunctionalElement> elements =
                functionalElementRepository.findBySpaceIdOrderByParentIdAscIdAsc(spaceId);

        if (elements.isEmpty()) {
            log.warn("spaceId={}에 해당하는 FunctionalElement가 없습니다.", spaceId);
            return FunctionalViewResponseDto.builder()
                    .nodes(List.of())
                    .edges(List.of())
                    .build();
        }

        log.info("spaceId={}의 FunctionalElement {} 개를 React Flow 규격으로 변환합니다.", spaceId, elements.size());

        List<FunctionalViewNodeDto> nodes = new ArrayList<>();
        List<FunctionalViewEdgeDto> edges = new ArrayList<>();

        for (FunctionalElement element : elements) {
            // 1. 노드 변환
            nodes.add(toNodeDto(element));

            // 2. 부모가 있는 경우 엣지 자동 생성
            if (element.getParentId() != null) {
                edges.add(FunctionalViewEdgeDto.builder()
                        .id("e-" + element.getParentId() + "-" + element.getId())
                        .source(String.valueOf(element.getParentId()))
                        .target(String.valueOf(element.getId()))
                        .animated(true)
                        .build());
            }
        }

        return FunctionalViewResponseDto.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }

    /**
     * FunctionalElement → React Flow Node DTO로 변환합니다.
     * elementType에 따라 노드 타입과 data 내용이 달라집니다.
     */
    private FunctionalViewNodeDto toNodeDto(FunctionalElement element) {
        String nodeType = switch (element.getElementType()) {
            case FOREST -> "forestNode";
            case TREE   -> "treeNode";
            case RING   -> "ringNode";
        };

        Map<String, Object> data = buildNodeData(element);

        return FunctionalViewNodeDto.builder()
                .id(String.valueOf(element.getId()))
                .type(nodeType)
                .parentId(element.getParentId() != null ? String.valueOf(element.getParentId()) : null)
                .data(data)
                .build();
    }

    /**
     * elementType에 따라 React Flow 노드의 data 맵을 구성합니다.
     */
    private Map<String, Object> buildNodeData(FunctionalElement element) {
        Map<String, Object> data = new HashMap<>();
        data.put("label", element.getName());

        if (element.getDescription() != null) {
            data.put("description", element.getDescription());
        }

        switch (element.getElementType()) {
            case FOREST -> {
                // Forest 노드: label + description만
            }
            case TREE -> {
                // Tree 노드: filePath 추가
                if (element.getFilePath() != null) {
                    data.put("filePath", element.getFilePath());
                }
            }
            case RING -> {
                // Ring 노드: filePath + HTTP 엔드포인트 정보 추가
                if (element.getFilePath() != null) {
                    data.put("filePath", element.getFilePath());
                }
                if (element.getApiMethod() != null) {
                    data.put("apiMethod", element.getApiMethod());
                }
                if (element.getApiUrl() != null) {
                    data.put("apiUrl", element.getApiUrl());
                }
            }
        }

        return data;
    }
}
