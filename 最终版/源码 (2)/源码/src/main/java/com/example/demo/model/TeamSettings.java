package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeamSettings {
    private Long id;
    private Long teamId;
    private String name;
    private String description;
    private String joinMethod;
    private String visibility;
    private String joinCode;
    private Integer levelLimit;
    private LocalDateTime updatedAt;
}
