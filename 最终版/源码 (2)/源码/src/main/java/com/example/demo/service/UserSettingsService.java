package com.example.demo.service;

import com.example.demo.controller.UserSettingsController;
import com.example.demo.mapper.UserMapper;
import com.example.demo.mapper.UserSettingsMapper;
import com.example.demo.model.User;
import com.example.demo.model.UserSettings;
import com.example.demo.util.PasswordUtil;
import com.example.demo.util.ZipUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class UserSettingsService {

    @Autowired
    private UserSettingsMapper userSettingsMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ActivityLogService activityLogService;

    public UserSettings getUserSettings(Long userId) {
        UserSettings settings = userSettingsMapper.findByUserId(userId);
        if (settings == null) {
            // 如果用户没有设置，创建默认设置
            settings = createDefaultSettings(userId);
        }
        return settings;
    }

    @Transactional
    public void updateProfile(Long userId, UserSettingsController.UserProfileRequest request) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        // 更新用户信息
        user.setPosition(request.getPosition());
        user.setContactInfo(request.getContact());
        userMapper.update(user);

        // 更新设置中的姓名（如果需要）
        UserSettings settings = getUserSettings(userId);
        Map<String, Boolean> privacySettings = settings.getPrivacySettings();
        if (privacySettings == null) {
            privacySettings = new HashMap<>();
        }

        // 这里可以根据需要添加更多隐私设置逻辑
        userSettingsMapper.update(settings);
    }

    public String submitExportTask(Long userId, UserSettingsController.ExportRequest req) {
        String taskId = UUID.randomUUID().toString();
        // 异步线程池 / MQ 真实处理
        CompletableFuture.runAsync(() -> {
            // 1. 查询用户数据
            // 2. 写 Excel/PDF
            // 3. 保存到 uploads/export/{userId}_{taskId}.zip
            Path folder = Paths.get("uploads/export");
            try {
                Files.createDirectories(folder);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
            Path file = folder.resolve(userId + "_" + taskId + ".zip");
            // 伪代码：把数据写进 zip
            try {
                ZipUtil.pack(new File("tempDir"), file.toFile());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
        return taskId;
    }

    @Transactional
    public void updateNotificationSettings(Long userId, UserSettingsController.NotificationSettingsRequest request) {
        UserSettings settings = getUserSettings(userId);

        Map<String, Boolean> notificationSettings = settings.getNotificationSettings();
        if (notificationSettings == null) {
            notificationSettings = new HashMap<>();
        }

        notificationSettings.put("email", request.getEmail());
        notificationSettings.put("desktop", request.getDesktop());

        settings.setNotificationSettings(notificationSettings);
        userSettingsMapper.update(settings);
    }

    private UserSettings createDefaultSettings(Long userId) {
        UserSettings settings = new UserSettings();
        settings.setUserId(userId);

        // 默认通知设置
        Map<String, Boolean> notificationSettings = new HashMap<>();
        notificationSettings.put("email", true);
        notificationSettings.put("desktop", true);
        settings.setNotificationSettings(notificationSettings);

        // 默认隐私设置
        Map<String, Boolean> privacySettings = new HashMap<>();
        privacySettings.put("profileVisible", true);
        settings.setPrivacySettings(privacySettings);

        // 默认语言和主题
        settings.setLanguage("zh-CN");
        settings.setTheme("light");

        userSettingsMapper.insert(settings);
        return settings;
    }
}