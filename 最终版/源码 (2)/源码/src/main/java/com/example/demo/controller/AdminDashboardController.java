package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.service.ActivityLogService;
import com.example.demo.util.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 后台仪表盘专用控制器
 * 只提供仪表盘首页所需接口，不与 AdminActivityLogController 冲突
 */
@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final ActivityLogService activityLogService;

    /**
     * 仪表盘首页：最近5条活动（简版）
     * 路径与 AdminActivityLogController 不冲突
     */
    @GetMapping("/recent-activities")
    public ApiResponse<?> recentActivities(
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        return ApiResponse.success(activityLogService.getRecentActivities(limit));
    }

    /**
     * 仪表盘：分页审计日志（简版）
     * 路径与 AdminActivityLogController 不冲突
     */
    @GetMapping("/activity-logs")
    public ApiResponse<PageInfo<?>> activityLogs(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        return ApiResponse.success(activityLogService.getActivityLogs(page, size));
    }

    /**
     * 删除日志（可选保留，路径不冲突）
     */
    @DeleteMapping("/logs/{id}")
    public ApiResponse<Void> deleteLog(@PathVariable Long id) {
        activityLogService.deleteActivityLog(id);
        return ApiResponse.success("日志已删除");
    }
}