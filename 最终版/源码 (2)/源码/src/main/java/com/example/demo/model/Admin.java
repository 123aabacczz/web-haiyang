package com.example.demo.model;

import lombok.Data;
import java.io.Serializable;

@Data
public class Admin implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;         // 管理员表ID
    private Long userId;     // 关联的用户ID
    private Integer adminLevel; // 管理员级别

    // 添加构造函数
    public Admin() {}

    public Admin(Long userId, Integer adminLevel) {
        this.userId = userId;
        this.adminLevel = adminLevel;
    }

    // 关联的用户信息
    private User user;

    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }
}