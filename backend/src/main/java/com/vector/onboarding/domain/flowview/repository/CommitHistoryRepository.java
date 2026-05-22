package com.vector.onboarding.domain.flowview.repository;

import com.vector.onboarding.domain.flowview.entity.CommitHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommitHistoryRepository extends JpaRepository<CommitHistory, Long> {
    /** 팀 격리: spaceId 기준으로 커밋 목록을 조회합니다. */
    List<CommitHistory> findBySpaceIdOrderByIdDesc(Long spaceId);

    /** repoName 기준 커밋 최신순 조회 */
    List<CommitHistory> findByRepoNameOrderByCommitDateDesc(String repoName);

    // 1️⃣ [에러 원인] 특정 커밋(sha)이 존재하는지 확인하는 메서드 추가
    boolean existsByCommitSha(String commitSha);
}
