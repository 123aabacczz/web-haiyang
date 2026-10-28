package com.example.demo.model;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrganizationStructure {
    private Long id;
    private String name;
    private String description;
    private Long parentId;
    private Long teamId;
    private Integer level;
    private String icon;
    private String badgeType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 关联的组织成员
    private List<OrganizationMembers> members;
    
    // 前端需要的字段
    private Integer member_count;
    private Integer reputation;
    private String activity_rate;
    private String establish_date;
    private String goal;
    private String location;
    private String tags;
}
