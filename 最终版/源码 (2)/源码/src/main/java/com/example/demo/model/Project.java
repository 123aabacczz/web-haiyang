package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Project {
    private Integer id;
    private String name;
    private String type;
    private Integer creatorId;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}