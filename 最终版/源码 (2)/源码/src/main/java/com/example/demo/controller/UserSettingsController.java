package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.LoginHistory;
import com.example.demo.model.User;
import com.example.demo.service.UserDeviceService;
import com.example.demo.model.UserDevice;
import com.example.demo.model.UserSettings;
import com.example.demo.service.UserService;
import com.example.demo.service.UserSettingsService;
import com.example.demo.util.PageInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@Slf4j
public class UserSettingsController {

    @Autowired
    private UserSettingsService userSettingsService;

    @Autowired
    private UserDeviceService userDeviceService;

    @Autowired
    private UserService userService;

    // 获取用户设置
    @GetMapping("/{userId}/settings")
    public ResponseEntity<ApiResponse<UserSettings>> getUserSettings(@PathVariable("userId") Long userId) {
        try {
            UserSettings settings = userSettingsService.getUserSettings(userId);
            return ResponseEntity.ok(ApiResponse.success("获取用户设置成功", settings));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // 更新个人信息
    @PutMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<Void>> updateProfile(@PathVariable("userId") Long userId,
                                                           @RequestBody UserProfileRequest request) {
        try {
            userSettingsService.updateProfile(userId, request);
            return ResponseEntity.ok(ApiResponse.success("个人信息更新成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // 更新通知设置
    @PutMapping("/{userId}/notifications")
    public ResponseEntity<ApiResponse<Void>> updateNotificationSettings(@PathVariable("userId") Long userId,
                                                                        @RequestBody NotificationSettingsRequest request) {
        try {
            userSettingsService.updateNotificationSettings(userId, request);
            return ResponseEntity.ok(ApiResponse.success("通知设置更新成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{userId}/devices")
    public ApiResponse<List<UserDevice>> getUserDevices(@PathVariable("userId") Long userId) { // 添加参数名称
        List<UserDevice> devices = userDeviceService.getUserDevices(userId);
        return ApiResponse.success("获取设备列表成功", devices);
    }

    @DeleteMapping("/{userId}/devices/{deviceId}")
    public ApiResponse<Void> logoutDevice(@PathVariable("userId") Long userId, @PathVariable("deviceId") String deviceId) {
        userDeviceService.logoutDevice(userId, deviceId);
        return ApiResponse.success("设备已退出登录");
    }

    // 在 UserSettingsController.java 中更新 getLoginHistory 方法
    @GetMapping("/{userId}/login-history")
    public ApiResponse<PageInfo<LoginHistory>> getLoginHistory(
            @PathVariable("userId") Long userId,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        PageInfo<LoginHistory> history = userDeviceService.getLoginHistory(userId, page, size);
        return ApiResponse.success("获取登录历史成功", history);
    }

    @PostMapping("/{userId}/export")
    public ApiResponse<String> exportUserData(@PathVariable Long userId,
                                              @RequestBody ExportRequest req) {
        String taskId = userSettingsService.submitExportTask(userId,req);
        return ApiResponse.success("已提交导出任务", taskId);
    }

    @GetMapping("/{userId}/export/{taskId}")
    public void downloadExport(@PathVariable Long userId,
                               @PathVariable String taskId,
                               HttpServletResponse resp) throws IOException {
        Path file = Paths.get("uploads/export/" + userId + "_" + taskId + ".zip");
        if (!Files.exists(file)) {
            resp.setStatus(HttpServletResponse.SC_ACCEPTED); // 202 还没好
            return;
        }
        resp.setContentType("application/zip");
        resp.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"userData_" + taskId + ".zip\"");
        Files.copy(file, resp.getOutputStream());
    }

    @PutMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> updatePassword(
            @PathVariable("userId") Long userId,
            @RequestBody PasswordUpdateRequest req,
            HttpServletRequest request) {

        // 从Session中获取当前用户
        HttpSession session = request.getSession(false);
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
        }

        User currentUser = (User) session.getAttribute("user");
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
        }

        // 使用Session中的用户ID进行鉴权
        if (!currentUser.getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("只能修改自己的密码"));
        }

        try {
            userService.changePassword(userId, req.getCurrentPassword(), req.getNewPassword());
            return ResponseEntity.ok(ApiResponse.success("密码修改成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{userId}/devices")
    public ApiResponse<Void> addDevice(@PathVariable("userId") Long userId,
                                       @RequestBody UserDevice device) {
        device.setUserId(userId);
        userDeviceService.saveDevice(device);   // 下面给出实现
        return ApiResponse.success("设备已记录");
    }

    @PostMapping("/{userId}/login-history")
    public ApiResponse<Void> addLoginHistory(@PathVariable("userId") Long userId,
                                             @RequestBody LoginHistory history) {
        history.setUserId(userId);
        userDeviceService.saveLoginHistory(history);
        return ApiResponse.success("登录历史已记录");
    }

    // 请求类定义
    public static class UserProfileRequest {
        private String name;
        private String position;
        private String contact;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPosition() { return position; }
        public void setPosition(String position) { this.position = position; }
        public String getContact() { return contact; }
        public void setContact(String contact) { this.contact = contact; }
    }

    public static class PasswordUpdateRequest {
        private String currentPassword;
        private String newPassword;

        // Getters and Setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class NotificationSettingsRequest {
        private Boolean email;
        private Boolean desktop;

        // Getters and Setters
        public Boolean getEmail() { return email; }
        public void setEmail(Boolean email) { this.email = email; }
        public Boolean getDesktop() { return desktop; }
        public void setDesktop(Boolean desktop) { this.desktop = desktop; }
    }

    public static class ExportRequest {
        private String format;        // "pdf" / "excel"
        private String dateRange;     // "week" / "month" / "custom"
        private String startDate;     // 当 dateRange=custom 时生效
        private String endDate;
        private boolean includeFiles;
        private boolean includeActivity;
    }
}