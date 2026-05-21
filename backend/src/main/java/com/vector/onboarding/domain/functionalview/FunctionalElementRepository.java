package com.vector.onboarding.domain.functionalview;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FunctionalElementRepository extends JpaRepository<FunctionalElement, Long> {

    /**
     * 특정 스페이스의 모든 기능 요소를 계층 순서대로 조회합니다.
     * parentId 오름차순(FOREST → TREE → RING 순) + id 오름차순 정렬.
     */
    List<FunctionalElement> findBySpaceIdOrderByParentIdAscIdAsc(Long spaceId);

    /**
     * 재분석 시 기존 데이터를 전체 초기화합니다.
     */
    void deleteBySpaceId(Long spaceId);
}
