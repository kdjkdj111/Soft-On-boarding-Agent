package com.vector.onboarding.domain.qa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QaCommentRepository extends JpaRepository<QaComment, Long> {
    List<QaComment> findByPostIdOrderByCreatedAtAsc(Long postId);
}
