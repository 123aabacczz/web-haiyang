package com.example.demo.controller;

import com.example.demo.mapper.UserMapper;
import com.example.demo.service.MaterialService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class DashboardController {

    private final UserService userService;
    private final MaterialService materialService;
    private final UserMapper userMapper;

    @GetMapping("/recent-activities")
    public List<Map<String, Object>> recentActivities(
            @RequestParam(name = "limit", defaultValue = "5") int limit
    ){
        // 假数据，可替换为 ActivityLogService
        return List.of(
                Map.of("id", 1, "description", "张三注册了账户", "timestamp", LocalDateTime.now().minusHours(1)),
                Map.of("id", 2, "description", "李四上传了资料", "timestamp", LocalDateTime.now().minusHours(2))
        );
    }

    @GetMapping("/dashboard-stats")
    public Map<String, Object> dashboardStats(
            @RequestParam(name = "days", defaultValue = "30") int days
    ){
        Map<String, Object> map = new HashMap<>();
        map.put("totalUsers", userService.countAll(null));
        map.put("pendingMaterials", materialService.countByStatus(0));
        map.put("newUsers", userService.countNewUsers(days));
        map.put("pendingIssues", 0);

        List<String> labels = new ArrayList<>();
        List<Integer> newUsers = new ArrayList<>();
        List<Integer> activeUsers = new ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime date = LocalDateTime.now().minusDays(i);
            labels.add(date.toLocalDate().toString());
            newUsers.add((int) userMapper.countNewUsers(date.toLocalDate().atStartOfDay()));
            activeUsers.add((int) userMapper.countActiveUsers(date.toLocalDate().atStartOfDay()));}

        map.put("chartData", Map.of("labels", labels, "newUsers", newUsers, "activeUsers", activeUsers));
        return map;
    }
}