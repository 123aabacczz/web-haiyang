package com.example.demo.model;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TeamDetails {
    private Long id;
    private Long teamId;
    private LocalDate establishDate;
    private String goal;
    private String location;
    private String tags;
    private Integer memberCount;
    private Double activityRate;
    private String type;
    private LocalDateTime lastUpdated;
}
