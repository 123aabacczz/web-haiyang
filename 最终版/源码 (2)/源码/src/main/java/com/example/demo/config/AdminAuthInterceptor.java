package com.example.demo.config;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Admin;
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
public class AdminAuthInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(AdminAuthInterceptor.class);

    // 不需要拦截的路径
    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
            "/api/admin/login",
            "/api/admin/logout",
            "/api/admin/current-admin",
            "/error",
            "/api/admin/materials/public",
            "/api/admin/materials/search",
            "/api/admin/materials/categories",   // 新增
            "/api/admin/materials/types",         // 新增
            "/api/admin/materials/",
            "/api/admin/materials"              // 新增，允许资料相关操作
    );

    // 需要管理员权限的路径
    private static final List<String> ADMIN_ONLY_PATHS = Arrays.asList(
            "/api/admin/users",
            "/api/admin/users/",
            "/api/admin/delete",
            "/api/admin/permissions"
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
            logger.warn("未授权的访问尝试: {} [Session: {}]", path, sessionId);
            sendErrorResponse(response, "请先登录管理员账户");
            return false;
        }
        else{
            long maxInactiveInterval = session.getMaxInactiveInterval();
            long lastAccessedTime = session.getLastAccessedTime();
            long currentTime = System.currentTimeMillis();
            long remainingTime = (lastAccessedTime + maxInactiveInterval * 1000 - currentTime) / 1000;

            // 如果会话已过期
            if (remainingTime <= 0) {
                session.invalidate();
                logger.warn("会话已过期: {} [Session: {}]", path, sessionId);
                sendErrorResponse(response, "会话已过期，请重新登录");
                return false;
            }
        }

        // 2. 检查管理员会话属性
        Object adminObj = session.getAttribute("admin");
        if (adminObj == null) {
            logger.warn("无效的管理员会话: {} [Session: {}]", path, sessionId);
            sendErrorResponse(response, "会话已过期，请重新登录");
            return false;
        }

        // 3. 验证管理员对象类型
        if (!(adminObj instanceof Admin)) {
            logger.error("无效的管理员对象类型: {} [Session: {}] [Type: {}]",
                    path, sessionId, adminObj.getClass().getName());
            sendErrorResponse(response, "系统错误: 管理员会话无效");
            return false;
        }

        Admin admin = (Admin) adminObj;

        // 4. 检查管理员权限等级
        if (requiresAdminLevel(path) && !hasSufficientAdminLevel(admin)) {
            // ✅ 修复：使用 admin.getUser().getUsername()
            logger.warn("权限不足: {} [Session: {}] [Admin: {}] [Level: {}]",
                    path, sessionId, admin.getUser().getUsername(), admin.getAdminLevel());
            sendErrorResponse(response, "权限不足，无法访问此功能");
            return false;
        }

        // 添加会话过期检查
        checkSessionExpiration(session, admin);

        return true;
    }

    private boolean isExcludedPath(String path) {
        return EXCLUDE_PATHS.stream().anyMatch(path::startsWith);
    }

    private boolean requiresAdminLevel(String path) {
        return ADMIN_ONLY_PATHS.stream().anyMatch(path::startsWith);
    }

    private boolean hasSufficientAdminLevel(Admin admin) {
        // 假设需要管理员等级 >= 3 才能访问敏感功能
        return admin.getAdminLevel() != null && admin.getAdminLevel() >= 3;
    }

    private void checkSessionExpiration(HttpSession session, Admin admin) {
        long maxInactiveInterval = session.getMaxInactiveInterval();
        long lastAccessedTime = session.getLastAccessedTime();
        long currentTime = System.currentTimeMillis();
        long remainingTime = (lastAccessedTime + maxInactiveInterval * 1000 - currentTime) / 1000;

        if (remainingTime < 300) { // 5分钟内过期
            // ✅ 修复：使用 admin.getUser().getUsername()
            logger.info("会话即将过期: [Admin: {}] [剩余时间: {}秒]",
                    admin.getUser().getUsername(), remainingTime);
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