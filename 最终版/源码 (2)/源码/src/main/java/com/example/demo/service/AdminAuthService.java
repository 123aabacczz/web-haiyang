package com.example.demo.service;

import com.example.demo.mapper.AdminMapper;
import com.example.demo.model.Admin;
import com.example.demo.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private final AdminMapper adminMapper;

    @Autowired
    public AdminAuthService(AdminMapper adminMapper) {
        this.adminMapper = adminMapper;
    }

    public Admin authenticate(String username, String password) {
        // 通过用户名查询管理员（包含关联的用户信息）
        Admin admin = adminMapper.selectByUsername(username);

        // 验证管理员存在且密码匹配
        if (admin != null &&
                admin.getUser() != null &&
                PasswordUtil.check(password, admin.getUser().getPassword())) {
            return admin;
        }
        return null;
    }
}