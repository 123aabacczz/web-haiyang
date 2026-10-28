package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamActivities {
    private Long id;
    private Long teamId;
    private String type;
    private String title;
    private String description;
    private LocalDateTime createdAt;
    private Long createdBy;
    // 关联的用户信息
    private User creator;
}
