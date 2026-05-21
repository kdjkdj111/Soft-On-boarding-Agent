package com.vector.onboarding.domain.dataview.repository;

import com.vector.onboarding.domain.dataview.entity.CommitHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommitHistoryRepository extends JpaRepository<CommitHistory, Long> {
    /** 팀 격리: spaceId 기준으로 커밋 목록을 조회합니다. */
    List<CommitHistory> findBySpaceIdOrderByIdDesc(Long spaceId);

    /** repoName 기준 커밋 최신순 조회 */
    List<CommitHistory> findByRepoNameOrderByCommitDateDesc(String repoName);
}
