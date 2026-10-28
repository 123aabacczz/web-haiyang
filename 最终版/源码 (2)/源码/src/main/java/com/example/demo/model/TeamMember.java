package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TeamMember {

    private Long id;

    private Long teamId;

    private Long userId;

    private String role;

    private LocalDateTime joinedAt;

    private User user;

    private Team team;
}