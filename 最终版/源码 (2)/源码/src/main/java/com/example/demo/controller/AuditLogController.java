package com.example.demo.controller;

import com.example.demo.model.ActivityLog;
import com.example.demo.util.PageInfo;
import com.example.demo.service.ActivityLogService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit")
public class AuditLogController {
    private final ActivityLogService activityLogService;

    public AuditLogController(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
    }

    @GetMapping("/logs")
    public PageInfo<ActivityLog> getLogs(
            @RequestParam(name = "page", defaultValue = "1") int page
    ) {
        return activityLogService.getActivityLogs(page, 10);
    }
}
