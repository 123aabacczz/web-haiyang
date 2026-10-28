package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class Team {
    private Long id;

    private String name;

    private String description;

    private Long organizerId;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private List<TeamMember> members;
    
    private Integer memberCount;

    private String role;

}
