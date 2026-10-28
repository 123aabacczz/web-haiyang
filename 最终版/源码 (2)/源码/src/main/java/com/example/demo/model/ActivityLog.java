package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityLog {
    private Long id;
    private Long userId;
    private String actionType; // CREATE, UPDATE, DELETE, APPROVE, REJECT
    private String targetType; // USER, MATERIAL, MODULE, PERMISSION
    private Long targetId;
    private String description;
    private LocalDateTime actionTime;
}