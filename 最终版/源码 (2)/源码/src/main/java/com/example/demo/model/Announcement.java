package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Announcement {
    private Long id;
    private String title;
    private String content;
    private String publisher;
    private Integer status; // 新增status属性
    private Integer important; // 新增字段

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishTime;

    @JsonProperty("createdAt")
    public LocalDateTime getCreatedAt() {
        return publishTime;
    }

    // 添加反向映射确保数据能正确接收
    @JsonProperty("createdAt")
    public void setCreatedAt(LocalDateTime createdAt) {
        this.publishTime = createdAt;
    }
}