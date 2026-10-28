package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
public class Report {
    private Long id;
    private String title;
    private String content;
    private String author;
    private LocalDateTime submitTime;
    private Integer status;
    private String reviewComment;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long creatorId;
    private String filePath; // 确保已有该字段
}