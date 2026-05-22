package com.vector.onboarding.domain.qa;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QaPostRepository extends JpaRepository<QaPost, Long> {
    Page<QaPost> findAllBySpaceIdOrderByCreatedAtDesc(Long spaceId, Pageable pageable);
}
