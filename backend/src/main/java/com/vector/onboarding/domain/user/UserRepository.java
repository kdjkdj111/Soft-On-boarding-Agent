package com.vector.onboarding.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByGithubId(String githubId);

    // N+1 방지: userId 목록으로 User 한 번에 조회
    @Query("SELECT u FROM User u WHERE u.id IN :userIds")
    List<User> findAllByIdIn(@Param("userIds") List<Long> userIds);
}
