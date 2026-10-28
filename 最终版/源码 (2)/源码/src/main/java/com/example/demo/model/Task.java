package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Task {
    private Long id;
    private String title;
    private String description;
    private Long assigneeId;
    private String assigneeName;
    private Integer priority;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long reviewerId;
    private String reviewerName;
    private LocalDateTime reviewTime;
    private String reviewComment;
    private String tags;
    private String attachmentUrl;
    private Integer progress;
    private Integer isDeleted;
    private Long creatorId; // 新增创建者ID字段
    private String creatorName; // 新增创建者名称字段
    private Long materialId; // 新增资料ID字段
    private Integer reward; // 新增奖励字段
}