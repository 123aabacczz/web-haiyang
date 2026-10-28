package com.example.demo.config;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class UserAuthInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(UserAuthInterceptor.class);

    // 不需要拦截的路径
    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
            "/api/login",
            "/api/register",
            "/api/forgot-password",
            "/api/home-info/announcements/important",
            "/api/home-info/announcements/latest",
            "/api/home-info/meetings", // 允许普通用户访问会议API
            "/api/home-info/meetings/recent",
            "/api/notifications/today",
            "/api/notifications/unread-count",
            "/api/videos", // 允许视频API访问
            "/api/files", // 允许文件API访问
            "/error"
    );

    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws IOException {

        String path = request.getRequestURI();

        // 检查是否为排除路径
        if (isExcludedPath(path)) {
            return true;
        }

        HttpSession session = request.getSession(false);
        String sessionId = session != null ? session.getId() : "no-session";

        // 1. 检查会话是否存在
        if (session == null) {
            logger.warn("未授权的用户访问尝试: {} [Session: {}]", path, sessionId);
            sendErrorResponse(response, "请先登录用户账户");
            return false;
        }

        // 2. 检查用户会话属性
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            logger.warn("无效的用户会话: {} [Session: {}]", path, sessionId);
            sendErrorResponse(response, "会话已过期，请重新登录");
            return false;
        }

        // 3. 验证用户对象类型
        if (!(userObj instanceof User)) {
            logger.error("无效的用户对象类型: {} [Session: {}] [Type: {}]",
                    path, sessionId, userObj.getClass().getName());
            sendErrorResponse(response, "系统错误: 用户会话无效");
            return false;
        }

        User user = (User) userObj;

        // 4. 检查用户状态
        if (user.getStatus() != 1) {
            logger.warn("用户账户状态异常: {} [Session: {}] [User: {}] [Status: {}]",
                    path, sessionId, user.getUsername(), user.getStatus());
            sendErrorResponse(response, "账户状态异常，无法访问此功能");
            return false;
        }

        // 5. 添加会话过期检查
        checkSessionExpiration(session, user);

        return true;
    }

    private boolean isExcludedPath(String path) {
        return EXCLUDE_PATHS.stream().anyMatch(path::startsWith);
    }

    private void checkSessionExpiration(HttpSession session, User user) {
        long maxInactiveInterval = session.getMaxInactiveInterval();
        long lastAccessedTime = session.getLastAccessedTime();
        long currentTime = System.currentTimeMillis();
        long remainingTime = (lastAccessedTime + maxInactiveInterval * 1000 - currentTime) / 1000;

        if (remainingTime < 300) { // 5分钟内过期
            logger.info("用户会话即将过期: [User: {}] [剩余时间: {}秒]",
                    user.getUsername(), remainingTime);
        }
    }

    private void sendErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        ObjectMapper mapper = new ObjectMapper();
        ApiResponse<?> errorResponse = ApiResponse.error(message);
        mapper.writeValue(response.getWriter(), errorResponse);
    }
}