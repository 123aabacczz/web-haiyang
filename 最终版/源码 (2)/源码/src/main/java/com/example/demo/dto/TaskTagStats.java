package com.example.demo.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskTagStats {
    private Long id;
    private String tagName;
    private Integer visitCount;
    private LocalDateTime lastVisited;
}