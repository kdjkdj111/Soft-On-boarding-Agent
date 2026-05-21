package com.vector.onboarding.domain.space.dto;

import lombok.Getter;

@Getter
public class MemberResponseDto {

    private final Long userId;
    private final String username;
    private final String email;
    private final String jobRole;
    @com.fasterxml.jackson.annotation.JsonProperty("isAdmin")
    private final boolean isAdmin;

    public MemberResponseDto(Long userId, String username, String email, String jobRole, boolean isAdmin) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.jobRole = jobRole;
        this.isAdmin = isAdmin;
    }
}
