package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Notification {
    public static final String TYPE_REGISTER = "REGISTER";
    public static final String TYPE_MATERIAL = "MATERIAL";
    public static final String TYPE_SYSTEM = "SYSTEM";
    private Long id;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String type; // 比如 "REGISTER"
}