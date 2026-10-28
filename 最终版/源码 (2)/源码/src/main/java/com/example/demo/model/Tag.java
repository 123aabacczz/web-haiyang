package com.example.demo.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Tag {
    private Long id;
    private String tagName;
    private Integer visitCount;
    private LocalDateTime lastVisited;

    // 添加构造函数
    public Tag() {}

    public Tag(Long id, String tagName, Integer visitCount, LocalDateTime lastVisited) {
        this.id = id;
        this.tagName = tagName;
        this.visitCount = visitCount;
        this.lastVisited = lastVisited;
    }
}