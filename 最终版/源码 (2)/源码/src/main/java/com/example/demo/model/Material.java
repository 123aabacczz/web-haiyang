package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Material {
    private Long id;
    private String name;
    private String type;
    private Long uploaderId;
    private String uploaderName;
    private String category;
    private Integer status;
    private LocalDateTime uploadTime;
    private String path;
    private String rejectReason;
    private String description;
    private Long fileSize; // 新增字段
    private Integer downloadCount; // 新增字段
    private Integer viewCount; // 新增字段
    private String tags;
    private String version;
    private String language;
    private Boolean isFeatured;
    private Integer featuredOrder;
    private String thumbnailPath;
    private String originalFilename;
    private Long projectId;
}