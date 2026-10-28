package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TeamPoints {
    private Long id;
    private Long teamId;
    private String teamName;
    private Integer points;
    private Integer todayPoints;
    private Long totalPoints;
    private Integer ranking;
    private LocalDateTime lastUpdated;
}
