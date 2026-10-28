package com.example.demo.service;

import com.example.demo.common.ApiResponse;
import com.example.demo.mapper.AdminMapper;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.Admin;
import com.example.demo.util.PageInfo;
import com.example.demo.model.User;
import com.example.demo.model.UserStatus;
import com.example.demo.util.PasswordUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class AdminService {

    private final UserMapper userMapper;
    private final AdminMapper adminMapper;

    public AdminService(UserMapper userMapper, AdminMapper adminMapper) {
        this.userMapper = userMapper;
        this.adminMapper = adminMapper;
    }

    @Transactional
    public PageInfo<User> getPendingUsers(int page, int size) {
        int offset = (page - 1) * size;
        List<User> users = userMapper.selectByStatus(UserStatus.PENDING.getCode(), offset, size);
        long total = userMapper.countByStatus(UserStatus.PENDING.getCode());
        return createPageInfo(users, page, size, total);
    }

    @Transactional
    public PageInfo<User> getAllUsers(int page, int size, String keyword) {
        try {
            int offset = (page - 1) * size;
            List<User> users = userMapper.selectAll(offset, size, keyword);
            long total = userMapper.countAll(keyword);
            return createPageInfo(users, page, size, total);
        } catch (Exception e) {
            log.error("获取用户列表失败", e);
            // 返回空结果而不是抛出异常
            return createPageInfo(new ArrayList<>(), page, size, 0);
        }
    }

    @Transactional
    public void approveRegistration(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getStatus() != 0)
            throw new RuntimeException("用户状态异常");
        userMapper.updateStatus(userId, 1);
    }

    @Transactional
    public void rejectRegistration(Long userId, String reason) {
        User user = userMapper.selectById(userId);
        if (user == null || user.getStatus() != 0)
            throw new RuntimeException("用户状态异常");
        userMapper.updateStatus(userId, 3);
    }

    @Transactional
    public void updateUserStatus(Long userId, String status) {
        int code = convertStatusNameToCode(status);
        userMapper.updateStatus(userId, code);
    }

    @Transactional
    public void deleteUser(Long userId) {
        // 先删除用户等级记录
        userMapper.deleteUserLevelByUserId(userId);
        // 再删除用户
        userMapper.deleteUserById(userId);
    }

    @Transactional
    public void register(User user) {
        if (userMapper.selectByUsername(user.getUsername()) != null)
            throw new RuntimeException("用户名已存在");
        if (userMapper.selectByEmail(user.getEmail()) != null)
            throw new RuntimeException("邮箱已注册");

        // ✅ 新增：暗号字段验证
        if (user.getSecret() == null || user.getSecret().trim().isEmpty()) {
            throw new RuntimeException("安全暗号不能为空");
        }

        user.setStatus(1); // 管理员添加用户直接激活
        user.setPassword(PasswordUtil.encrypt(user.getPassword()));
        user.setRole(user.getRole() != null ? user.getRole() : "user");

        if (userMapper.insertUser(user) == 0) {
            throw new RuntimeException("用户添加失败");
        }

        // 添加用户等级记录
        if ("user".equals(user.getRole())) {
            Integer userLevel = user.getUserLevel() != null ? user.getUserLevel() : 1;
            userMapper.insertUserLevel(user.getId(), userLevel);
        }
    }

    @Transactional
    public ApiResponse<Map<String, Object>> adminLogin(Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");
        User user = userMapper.selectByUsername(username);

        if (user == null || !PasswordUtil.check(password, user.getPassword())) {
            return ApiResponse.error("用户名或密码错误");
        }
        if (!"admin".equals(user.getRole())) {
            return ApiResponse.error("无管理员权限");
        }

        if (!user.getRole().startsWith("level") && !"user".equals(user.getRole())) {
            return ApiResponse.error("无管理员权限");
        }

        user.setPassword(null);
        String token = "mock-admin-jwt-" + user.getId();
        return ApiResponse.success("管理员登录成功", Map.of("user", user, "token", token));
    }

    private PageInfo<User> createPageInfo(List<User> users, int page, int size, long total) {
        PageInfo<User> pageInfo = new PageInfo<>();
        pageInfo.setItems(users);
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);
        return pageInfo;
    }

    private int convertStatusNameToCode(String status) {
        switch (status.toLowerCase()) {
            case "active":
            case "1":
                return 1;
            case "inactive":
            case "0":
                return 0;
            case "pending":
            case "2":
                return 2;
            default:
                throw new IllegalArgumentException("无效状态");
        }
    }

    @Transactional
    public void updateUser(User user, Integer adminLevel) {
        User existingUser = userMapper.selectById(user.getId());
        if (existingUser == null) {
            throw new RuntimeException("用户不存在");
        }

        // 检查用户名是否重复
        User userByUsername = userMapper.selectByUsername(user.getUsername());
        if (userByUsername != null && !userByUsername.getId().equals(user.getId())) {
            throw new RuntimeException("用户名已被使用");
        }

        // 检查邮箱是否重复
        User userByEmail = userMapper.selectByEmail(user.getEmail());
        if (userByEmail != null && !userByEmail.getId().equals(user.getId())) {
            throw new RuntimeException("邮箱已被使用");
        }

        // 只允许三种角色类型
        if (!Arrays.asList("temporary", "user", "admin").contains(user.getRole())) {
            throw new RuntimeException("无效的用户角色");
        }

        // 更新用户基本信息
        existingUser.setUsername(user.getUsername());
        existingUser.setEmail(user.getEmail());
        existingUser.setRole(user.getRole());
        userMapper.updateUser(existingUser);

        // 处理管理员等级
        if ("admin".equals(user.getRole())) {
            Admin admin = adminMapper.selectByUserId(user.getId());
            if (admin == null) {
                admin = new Admin();
                admin.setUserId(user.getId());
                admin.setAdminLevel(adminLevel);
                adminMapper.insertAdmin(admin);
            } else {
                admin.setAdminLevel(adminLevel);
                adminMapper.updateAdmin(admin);
            }
        } else {
            // 非管理员角色，删除管理员记录
            adminMapper.deleteByUserId(user.getId());

            // 更新或添加用户等级
            Integer userLevel = user.getUserLevel() != null ? user.getUserLevel() : 1;
            if (userMapper.selectUserLevelByUserId(user.getId()) != null) {
                userMapper.updateUserLevel(user.getId(), userLevel);
            } else {
                userMapper.insertUserLevel(user.getId(), userLevel);
            }
        }
    }
    public Admin getAdminByUserId(Long userId) {
        return adminMapper.selectByUserId(userId);
    }

    public User getUserById(Long userId) {
        User user = userMapper.selectById(userId);
        user.setPassword(null);

        // 添加管理员等级信息
        if ("admin".equals(user.getRole())) {
            Admin admin = adminMapper.selectByUserId(userId);
            if (admin != null) {
                user.setAdminLevel(admin.getAdminLevel());
            }
        }

        return user;
    }
}