package com.example.demo.controller;

import com.example.demo.model.ActivityLog;
import com.example.demo.util.PageInfo;
import com.example.demo.service.ActivityLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@Slf4j
public class ActivityLogController {
    private final ActivityLogService activityLogService;

    public ActivityLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @PostMapping("/log")
    public void logActivity(
            @RequestParam(name = "actionType") String actionType,
            @RequestParam(name = "targetType") String targetType,
            @RequestParam(name = "targetId") Long targetId,
            @RequestParam(name = "description") String description
    ) {
        activityLogService.logActivity(actionType, targetType, targetId, description);
    }

    @GetMapping("/recent")
    public List<ActivityLog> getRecentActivities(
            @RequestParam(name = "limit") int limit
    ) {
        return activityLogService.getRecentActivities(limit);
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<PageInfo<ActivityLog>> getActivityLogs(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(activityLogService.getActivityLogs(page, size));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityLog(@PathVariable Long id) {
        try {
            activityLogService.deleteActivityLog(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("删除活动日志失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}