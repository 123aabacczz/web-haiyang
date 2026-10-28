package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserTaskCenter {
    private Long id;
    private Long userId;
    private Integer points;
    private Integer acceptedTasks;
    private Integer completedTasks;
    private Integer todayPoints;
    private Integer level;
    private Integer experience;
    private Integer nextLevelExperience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
