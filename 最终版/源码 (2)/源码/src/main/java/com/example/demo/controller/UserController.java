package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.LoginHistory;
import com.example.demo.model.User;
import com.example.demo.model.UserDevice;
import com.example.demo.service.LocationService;
import com.example.demo.service.UserDeviceService;
import com.example.demo.service.UserService;
import com.example.demo.util.IpUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private final UserDeviceService userDeviceService;

    @Autowired
    private LocationService locationService;

    public UserController(UserService userService, UserMapper userMapper, UserDeviceService userDeviceService) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.userDeviceService = userDeviceService;
    }

    @PostMapping("/register")
    public ApiResponse<String> register(@RequestBody User user) {
        userService.register(user);
        return ApiResponse.success("注册成功，请等待管理员审核");
    }

    @PostMapping("/user/{userId}/change-password")
    public ApiResponse<String> changePassword(@PathVariable Long userId,
                                              @RequestBody Map<String,String> req) {
        try {
            userService.changePassword(userId, req.get("oldPassword"), req.get("newPassword"));
            return ApiResponse.success("密码已修改");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ApiResponse<Map<String,Object>> login(@RequestBody Map<String,String> credentials,
                                                 HttpServletRequest request) {
        try {
            String username = credentials.get("username");
            String password = credentials.get("password");
            User user = userService.login(username, password);
            user.setPassword(null);

            HttpSession session = request.getSession();
            session.setAttribute("user", user);
            session.setMaxInactiveInterval(3600);

            try {
                String deviceId   = credentials.get("deviceId");
                String deviceName = credentials.get("deviceName");
                String browser    = credentials.get("browser");
                String os         = credentials.get("os");

                // ✅ 获取 IP + 自动替换本地地址
                String ip = IpUtil.getIpAddr(request);
                if ("0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip)) {
                    ip = credentials.getOrDefault("ipAddress", ip); // 前端传来的公网 IP
                }

                String location = locationService.getLocation(ip);

                if (deviceId != null) {
                    UserDevice dev = new UserDevice();
                    dev.setUserId(user.getId());
                    dev.setDeviceId(deviceId);
                    dev.setDeviceName(deviceName);
                    dev.setBrowser(browser);
                    dev.setOs(os);
                    dev.setIpAddress(ip);
                    dev.setLocation(location);
                    dev.setLastActivity(LocalDateTime.now());
                    userDeviceService.saveDevice(dev);

                    LoginHistory hist = new LoginHistory();
                    hist.setUserId(user.getId());
                    hist.setDeviceId(deviceId);
                    hist.setBrowser(browser);
                    hist.setOs(os);
                    hist.setIpAddress(ip);
                    hist.setLocation(location);
                    hist.setLoginTime(LocalDateTime.now());
                    hist.setStatus("成功");
                    userDeviceService.saveLoginHistory(hist);
                }
            } catch (Exception e) {
                log.warn("记录设备/登录历史失败: {}", e.getMessage());
            }

            Map<String,Object> data = new HashMap<>();
            data.put("user", user);
            data.put("token", "mock-jwt-" + user.getId());

            // ✅ 调试：看看前端到底传了什么
            log.info("前端传来的 ipAddress = {}", credentials.get("ipAddress"));

            String ip = IpUtil.getIpAddr(request);
            if ("0:0:0:0:0:0:0:1".equals(ip) || "127.0.0.1".equals(ip)) {
                ip = credentials.getOrDefault("ipAddress", ip);
            }
            log.info("最终使用的 ip = {}", ip);

            return ApiResponse.success("登录成功", data);
        } catch (Exception e) {
            log.error("登录失败: {}", e.getMessage());
            e.printStackTrace();
            return ApiResponse.error("登录失败: " + e.getMessage());
        }
    }

    @PostMapping("/logout")
    public ApiResponse<String> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ApiResponse.success("登出成功");
    }

    @GetMapping("/current-user")
    public ResponseEntity<ApiResponse<User>> getCurrentUser(HttpServletRequest request) {
        try {
            HttpSession session = request.getSession(false);
            if (session == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("用户未登录"));
            }

            User user = (User) session.getAttribute("user");
            if (user == null) {
                // 尝试从安全上下文获取
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.isAuthenticated()) {
                    String username = auth.getName();
                    user = userService.findByUsername(username);
                    if (user != null) {
                        session.setAttribute("user", user);
                    }
                }
            }

            if (user == null) {
                return ResponseEntity.badRequest().body(ApiResponse.error("用户会话已过期"));
            }

            return ResponseEntity.ok(ApiResponse.success("获取当前用户成功", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            userService.resetPassword(
                    request.get("email"),
                    request.get("secret"),
                    request.get("newPassword"));
            return ApiResponse.success("密码重置成功");
        } catch (Exception e) {
            return ApiResponse.error(e.getMessage());
        }
    }
}