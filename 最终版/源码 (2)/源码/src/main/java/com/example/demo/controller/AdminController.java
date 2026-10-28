package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Admin;
import com.example.demo.service.AdminAuthService;
import com.example.demo.util.PageInfo;
import com.example.demo.model.User;
import com.example.demo.service.AdminService;
import jakarta.servlet.http.HttpSession;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final AdminAuthService adminAuthService;

    public AdminController(AdminService adminService, AdminAuthService adminAuthService) {
        this.adminService = adminService;
        this.adminAuthService = adminAuthService;
    }

    @GetMapping("/pending-users")
    public ApiResponse<PageInfo<User>> getPendingUsers(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        return ApiResponse.success(adminService.getPendingUsers(page, size));
    }

    @GetMapping("/users")
    public ApiResponse<PageInfo<User>> getAllUsers(
            @RequestParam(name = "page", required = false, defaultValue = "1") int page,
            @RequestParam(name = "size", required = false, defaultValue = "10") int size,
            @RequestParam(name = "keyword", required = false) String keyword
    ) {
        // 确保参数有效
        page = Math.max(1, page);
        size = Math.max(1, Math.min(size, 100)); // 限制每页最大100条

        return ApiResponse.success(adminService.getAllUsers(page, size, keyword));
    }

    @DeleteMapping("/users/{userId}")
    public ApiResponse<String> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ApiResponse.success("用户已删除"); // 这会返回JSON {success:true, message:"用户已删除", data:null}
    }

    @PostMapping("/approve-user")
    public ApiResponse<String> approveUser(@RequestBody Map<String, Long> request) {
        adminService.approveRegistration(request.get("userId"));
        return ApiResponse.success("用户审核通过");
    }

    @PostMapping("/reject-user")
    public ApiResponse<String> rejectUser(@RequestBody Map<String, Object> request) {
        Long userId = ((Number) request.get("userId")).longValue();
        String reason = (String) request.get("reason");
        adminService.rejectRegistration(userId, reason);
        return ApiResponse.success("用户已拒绝");
    }

    @PostMapping("/users")
    public ApiResponse<String> addUser(
            @Validated(User.CreateGroup.class) @RequestBody User user) {
        adminService.register(user);
        return ApiResponse.success("用户添加成功"); // 返回统一格式的JSON响应
    }

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> adminLogin(
            @RequestBody Map<String, String> credentials,
            HttpSession session) {

        String username = credentials.get("username");
        String password = credentials.get("password");

        Admin admin = adminAuthService.authenticate(username, password);

        // ✅ 添加空值检查
        if (admin == null) {
            return ApiResponse.error("用户名或密码错误");
        }

        // ✅ 确保用户信息存在
        if (admin.getUser() == null) {
            log.warn("管理员 {} 缺少关联用户信息", username);
            return ApiResponse.error("管理员账户配置错误");
        }

        // 保存管理员信息到会话
        session.setAttribute("admin", admin);

        Map<String, Object> data = Map.of(
                "id", admin.getId(),
                "userId", admin.getUserId(),
                "username", admin.getUser().getUsername(),
                "adminLevel", admin.getAdminLevel()
        );

        // 设置会话1分钟后过期
        session.setMaxInactiveInterval(300); // 300秒 = 5分钟

        return ApiResponse.success("管理员登录成功", data);
    }

    @GetMapping("/current-admin")
    public ApiResponse<Map<String, Object>> getCurrentAdmin(HttpSession session) {
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin == null) {
            return ApiResponse.error("未登录");
        }

        // ✅ 确保返回的数据结构与前端期望一致
        Map<String, Object> data = Map.of(
                "success", true,
                "data", Map.of(
                        "username", admin.getUser().getUsername(),
                        "adminLevel", admin.getAdminLevel()
                )
        );
        return ApiResponse.success(data);
    }

    @PostMapping("/logout")
    public ApiResponse<String> adminLogout(HttpSession session) {
        session.invalidate();
        return ApiResponse.success("退出成功");
    }

    @PutMapping("/users/{userId}/status")
    public ApiResponse<String> updateUserStatus(
            @PathVariable(name = "userId") Long userId,
            @RequestParam(name = "status") String status
    ) {
        adminService.updateUserStatus(userId, status);
        return ApiResponse.success("用户状态已更新");
    }

    @GetMapping("/users/{userId}")
    public ApiResponse<User> getUserById(@PathVariable Long userId) {
        User user = adminService.getUserById(userId);
        user.setPassword(null);

        // 添加管理员等级信息
        if ("admin".equals(user.getRole())) {
            Admin admin = adminService.getAdminByUserId(userId);
            if (admin != null) {
                user.setAdminLevel(admin.getAdminLevel());
            }
        }

        return ApiResponse.success(user);
    }

    @PutMapping("/users/{userId}")
    public ApiResponse<String> updateUser(
            @PathVariable Long userId,
            @Validated(User.UpdateGroup.class) @RequestBody UserUpdateRequest request) {

        User user = new User();
        user.setId(userId);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        adminService.updateUser(user, request.getAdminLevel());
        return ApiResponse.success("用户信息已更新");
    }

    public static class UserUpdateRequest {
        @Getter
        @Setter
        private String username;
        @Getter
        @Setter
        private String email;
        @Getter
        @Setter
        private String role;
        @Getter
        @Setter
        private Integer adminLevel;
    }
}