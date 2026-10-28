package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamApplication {
    private Long id;

    private Long teamId;

    private Long userId;

    private String status;

    private LocalDateTime appliedAt;

    private LocalDateTime processedAt;

    private Long processorId;

    private Team team;

    private User user;

    private User processor;
}