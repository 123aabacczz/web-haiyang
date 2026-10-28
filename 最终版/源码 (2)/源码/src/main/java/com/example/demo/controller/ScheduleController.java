package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Schedule;
import com.example.demo.model.Admin;
import com.example.demo.model.User;
import com.example.demo.service.ScheduleService;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@Slf4j
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    // 获取所有日程列表
    @GetMapping
    public ApiResponse<List<Schedule>> getSchedules(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            HttpSession session) {

        // 从会话中获取用户信息
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ApiResponse.error("用户未登录", 401);
        }

        List<Schedule> schedules = scheduleService.getSchedulesByUserAndDateRange(userId, start, end);
        return ApiResponse.success(schedules);
    }

    // 获取当前用户的近期日程
    @GetMapping("/upcoming")
    public ApiResponse<List<Schedule>> getUpcomingSchedules(
            @RequestParam(value = "limit", defaultValue = "5") int limit,
            HttpSession session) {

        // 从会话中获取用户信息
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ApiResponse.error("用户未登录", 401);
        }

        List<Schedule> upcomingSchedules = scheduleService.getUpcomingSchedules(userId, limit);
        return ApiResponse.success(upcomingSchedules);
    }

    // 创建新日程
    @PostMapping
    public ApiResponse<Schedule> createSchedule(@RequestBody Schedule schedule, HttpSession session) {
        // 从会话中获取用户ID
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            log.warn("用户未登录，会话信息: {}", session.getId());
            return ApiResponse.error("用户未登录", 401);
        }

        // 设置用户ID到日程对象
        schedule.setUserId(userId);

        // 添加日志记录接收到的数据
        log.info("创建日程 - 用户ID: {}, 日程数据: {}", userId, schedule);

        Schedule createdSchedule = scheduleService.createSchedule(schedule);

        // 添加创建成功日志
        log.info("日程创建成功 - ID: {}", createdSchedule.getId());

        return ApiResponse.success("日程创建成功", createdSchedule);
    }

    // 更新日程
    @PutMapping("/{id}")
    public ApiResponse<Schedule> updateSchedule(
            @PathVariable Long id,
            @RequestBody Schedule schedule,
            HttpSession session) {

        // 从会话中获取用户ID
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ApiResponse.error("用户未登录", 401);
        }

        // 验证日程是否属于当前用户
        if (!scheduleService.isScheduleOwnedByUser(id, userId)) {
            return ApiResponse.error("无权操作此日程", 403);
        }

        Schedule updatedSchedule = scheduleService.updateSchedule(id, schedule);
        if (updatedSchedule != null) {
            return ApiResponse.success("日程更新成功", updatedSchedule);
        }
        return ApiResponse.error("日程不存在", 404);
    }

    // 删除日程
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteSchedule(@PathVariable Long id, HttpSession session) {
        // 从会话中获取用户ID
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ApiResponse.error("用户未登录", 401);
        }

        // 验证日程是否属于当前用户
        if (!scheduleService.isScheduleOwnedByUser(id, userId)) {
            return ApiResponse.error("无权操作此日程", 403);
        }

        scheduleService.deleteSchedule(id);
        return ApiResponse.success("日程删除成功");
    }

    // 从会话中获取用户ID的辅助方法
    private Long getUserIdFromSession(HttpSession session) {
        // 先尝试从user属性获取（普通用户）
        User user = (User) session.getAttribute("user");
        if (user != null) {
            return user.getId();
        }

        // 再尝试从admin属性获取（管理员）
        Admin admin = (Admin) session.getAttribute("admin");
        if (admin != null && admin.getUser() != null) {
            return admin.getUser().getId();
        }

        // 最后尝试直接获取userId属性（兼容旧代码）
        Long userId = (Long) session.getAttribute("userId");
        if (userId != null) {
            return userId;
        }

        return null;
    }
}