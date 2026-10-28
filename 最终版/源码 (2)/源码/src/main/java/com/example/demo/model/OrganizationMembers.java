package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class OrganizationMembers {
    private Long id;
    private Long orgId;
    private Long teamMemberId;
    private String position;
    private LocalDateTime joinedAt;
    // 关联的团队成员信息
    private TeamMember teamMember;
}
