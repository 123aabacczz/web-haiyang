package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.ActivityLog;
import com.example.demo.service.ActivityLogService;
import com.example.demo.util.PageInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 后台操作审计专用控制器
 */
@RestController
@RequestMapping({"/api/admin/activity", "/api/activity/manage"})
@Slf4j
@RequiredArgsConstructor
public class AdminActivityLogController {

    private final ActivityLogService activityLogService;

    /* ====== 分页审计日志 ====== */
    @GetMapping("/activity-logs")
    public ApiResponse<PageInfo<ActivityLog>> logs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(activityLogService.getActivityLogs(page, size));
    }

    /* ====== 最近活动 ====== */
    @GetMapping("/recent")
    public ApiResponse<List<ActivityLog>> recent(
            @RequestParam(defaultValue = "20") int limit) {
        return ApiResponse.success(activityLogService.getRecentActivities(limit));
    }

    /* ====== 删除单条日志 ====== */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        activityLogService.deleteActivityLog(id);
        return ApiResponse.success("日志已删除");
    }
}