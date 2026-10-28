package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserPoints {
    private Long id;
    private Integer userId;
    private String username;
    private Integer points;
    private Integer todayPoints;
    private Long totalPoints;
    private Integer ranking;
    private LocalDateTime lastUpdated;
}
