package com.vector.onboarding.domain.user.dto;

import com.vector.onboarding.domain.space.Space;
import com.vector.onboarding.domain.space.SpaceMemberRole;
import com.vector.onboarding.domain.user.User;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class UserProfileResponseDto {

    private String userName;
    private String userEmail;
    private String role; // jobRole from SpaceMember
    private TeamInfo teamInfo;

    public UserProfileResponseDto(User user, Space space, String jobRole, SpaceMemberRole memberRole) {
        this.userName = user.getUsername();
        this.userEmail = user.getEmail();
        this.role = jobRole != null ? jobRole : "팀 없음";
        
        if (space != null) {
            this.teamInfo = new TeamInfo(
                    space.getId(),
                    space.getName(),
                    space.getTeamCode(),
                    space.getRepoUrl(),
                    space.getCreatedAt(),
                    memberRole == SpaceMemberRole.ADMIN
            );
        } else {
            this.teamInfo = null;
        }
    }

    @Getter
    public static class TeamInfo {
        private Long spaceId;
        private String teamName;
        private String teamCode;
        private String repoUrl;
        private LocalDateTime createdAt;
        @com.fasterxml.jackson.annotation.JsonProperty("isAdmin")
        private boolean isAdmin;

        public TeamInfo(Long spaceId, String teamName, String teamCode, String repoUrl, LocalDateTime createdAt, boolean isAdmin) {
            this.spaceId = spaceId;
            this.teamName = teamName;
            this.teamCode = teamCode;
            this.repoUrl = repoUrl;
            this.createdAt = createdAt;
            this.isAdmin = isAdmin;
        }
    }
}
