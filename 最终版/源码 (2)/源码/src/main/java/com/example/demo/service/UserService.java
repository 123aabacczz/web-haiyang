package com.example.demo.service;

import com.example.demo.mapper.UserMapper;
import com.example.demo.model.User;
import com.example.demo.util.PasswordUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
public class UserService implements UserProvider {
    private final UserMapper userMapper;

    @Autowired(required = false)
    @Lazy
    private ActivityLogService activityLogService;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Transactional
    public void register(User user) {
        if (userMapper.selectByUsername(user.getUsername()) != null)
            throw new RuntimeException("用户名已存在");
        if (userMapper.selectByEmail(user.getEmail()) != null)
            throw new RuntimeException("邮箱已注册");

        user.setStatus(0); // 待审核
        user.setPassword(PasswordUtil.encrypt(user.getPassword()));
        user.setRole("user");

        if (userMapper.insertUser(user) == 0) {
            throw new RuntimeException("用户注册失败");
        }

        user.setStatus(1);

        // 添加用户等级记录
        if ("user".equals(user.getRole())) {
            Integer userLevel = user.getUserLevel() != null ? user.getUserLevel() : 1;
            userMapper.insertUserLevel(user.getId(), userLevel);
        }

        if (activityLogService != null) {
            activityLogService.logActivity(
                    "REGISTER",
                    "USER",
                    user.getId(),
                    "新用户注册申请: " + user.getUsername() + " (" + user.getEmail() + ")",
                    "REGISTER_AUDIT"
            );
        } else {
            log.warn("ActivityLogService未初始化，跳过审计日志记录。用户ID: {}", user.getId());
        }
    }

    // UserService.java 中修改 changePassword 方法
    @Transactional
    public void changePassword(Long userId, String oldPwd, String newPwd) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new RuntimeException("用户不存在");
        // ✅ 先校验旧密码
        if (!PasswordUtil.check(oldPwd, user.getPassword())) {
            throw new RuntimeException("旧密码错误");
        }

        // 使用与UserSettingsService相同的密码检查方法
        if (!PasswordUtil.check(oldPwd, user.getPassword())) {
            log.warn("用户ID {} 的旧密码验证失败", userId);
            throw new RuntimeException("旧密码错误");
        }

        // 密码强度验证（与UserSettingsService保持一致）
        if (newPwd.length() < 8) {
            log.warn("用户ID {} 的新密码长度不足", userId);
            throw new RuntimeException("新密码长度至少8位");
        }
        if (!newPwd.matches(".*[A-Z].*")) {
            log.warn("用户ID {} 的新密码缺少大写字母", userId);
            throw new RuntimeException("新密码必须包含大写字母");
        }
        if (!newPwd.matches(".*[a-z].*")) {
            log.warn("用户ID {} 的新密码缺少小写字母", userId);
            throw new RuntimeException("新密码必须包含小写字母");
        }
        if (!newPwd.matches(".*\\d.*")) {
            log.warn("用户ID {} 的新密码缺少数字", userId);
            throw new RuntimeException("新密码必须包含数字");
        }

        // 使用相同的加密方法
        int result = userMapper.updatePasswordById(userId, PasswordUtil.encrypt(newPwd));
        if (result == 0) {
            log.error("用户ID {} 密码更新失败，数据库操作返回0", userId);
            throw new RuntimeException("密码更新失败");
        }

        log.info("用户ID {} 通过UserController.changePassword成功修改密码", userId);

        // 记录活动日志
        if (activityLogService != null) {
            activityLogService.logActivity(
                    "PASSWORD_CHANGE",
                    "USER",
                    userId,
                    "用户修改密码成功",
                    "SECURITY"
            );
        } else {
            log.warn("ActivityLogService为null，无法记录密码修改活动日志");
        }
    }

    @Override
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            User user = userMapper.selectByUsername(username);
            return user != null ? user.getId() : 0L;
        }
        return 0L;
    }

    @Transactional
    public Long getUserIdByUsername(String username) {
        User user = userMapper.selectByUsername(username);
        return user != null ? user.getId() : null;
    }

    @Transactional
    public User login(String username, String password) {
        log.info("Login attempt for username: {}", username);
        User user = userMapper.selectByUsername(username);
        log.info("Found user: {}", user != null ? user.getUsername() : "null");
        
        if (user == null) {
            log.info("User not found: {}", username);
            throw new RuntimeException("用户名或密码错误");
        }
        
        log.info("User password: {}", user.getPassword() != null ? "******" : "null");
        if (!PasswordUtil.check(password, user.getPassword())) {
            log.info("Password check failed for user: {}", username);
            throw new RuntimeException("用户名或密码错误");
        }
        
        if (user.getStatus() != 1) {
            log.info("User account disabled: {}", username);
            throw new RuntimeException("账户已禁用");
        }

        // 获取用户等级
        Integer userLevel = userMapper.selectUserLevelByUserId(user.getId());
        log.info("User level: {}", userLevel);
        user.setUserLevel(userLevel != null ? userLevel : 1); // 默认等级为1

        return user;
    }

    @Transactional
    public void resetPassword(String email, String secret, String newPwd) {
        User user = userMapper.validateSecret(email, secret);
        if (user == null)
            throw new RuntimeException("邮箱或暗号错误");
        userMapper.updatePassword(email, PasswordUtil.encrypt(newPwd));
    }

    @Transactional
    public User findByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    public long countAll(String keyword) {
        return userMapper.countAll(keyword);
    }

    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    /**
     * 获取用户等级（以 user_levels 表为准，缺失时默认 1）
     */
    public Integer getUserLevel(Long userId) {
        Integer level = userMapper.selectUserLevelByUserId(userId);
        return level != null ? level : 1;
    }

    public long countNewUsers(int days) {
        return userMapper.countNewUsers(LocalDateTime.now().minusDays(days));
    }
}