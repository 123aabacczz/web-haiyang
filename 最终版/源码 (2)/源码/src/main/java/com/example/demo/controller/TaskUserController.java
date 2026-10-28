package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Task;
import com.example.demo.service.TaskService;
import com.example.demo.service.TaskTagRelationService;
import com.example.demo.util.PageInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/tasks")
@Slf4j
public class TaskUserController {

    @Autowired
    private TaskService taskService;
    
    @Autowired
    private TaskTagRelationService taskTagRelationService;

    // 获取用户的任务列表
    @GetMapping("/my-tasks")
    public ApiResponse<PageInfo<Task>> getMyTasks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer status) {
        try {
            // 这里需要从会话中获取当前用户ID
            // Long currentUserId = getCurrentUserId();
            // 暂时返回所有任务作为演示
            PageInfo<Task> tasks = taskService.getTasks(status, null, null, page, size);
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            log.error("获取我的任务失败", e);
            return ApiResponse.error("获取任务失败: " + e.getMessage());
        }
    }

    // 接受任务
    @PostMapping("/{taskId}/accept")
    public ApiResponse<Task> acceptTask(@PathVariable Long taskId) {
        try {
            Task task = taskService.getTaskById(taskId);
            if (task == null) {
                return ApiResponse.error("任务不存在");
            }

            if (task.getStatus() != 0) {
                return ApiResponse.error("任务状态不允许接受");
            }

            // 更新任务状态为进行中
            task.setStatus(3); // 3 表示进行中
            Task updatedTask = taskService.updateTask(task);

            return ApiResponse.success("任务接受成功", updatedTask);
        } catch (Exception e) {
            log.error("接受任务失败", e);
            return ApiResponse.error("接受任务失败: " + e.getMessage());
        }
    }

    // 更新任务进度
    @PutMapping("/{taskId}/progress")
    public ApiResponse<Task> updateTaskProgress(
            @PathVariable Long taskId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer progress = request.get("progress");
            if (progress == null || progress < 0 || progress > 100) {
                return ApiResponse.error("进度值无效");
            }

            Task task = taskService.getTaskById(taskId);
            if (task == null) {
                return ApiResponse.error("任务不存在");
            }

            task.setProgress(progress);
            Task updatedTask = taskService.updateTask(task);

            return ApiResponse.success("进度更新成功", updatedTask);
        } catch (Exception e) {
            log.error("更新任务进度失败", e);
            return ApiResponse.error("更新进度失败: " + e.getMessage());
        }
    }

    // 完成任务
    @PostMapping("/{taskId}/complete")
    public ApiResponse<Task> completeTask(@PathVariable Long taskId) {
        try {
            Task task = taskService.getTaskById(taskId);
            if (task == null) {
                return ApiResponse.error("任务不存在");
            }

            // 更新任务状态为已完成
            task.setStatus(4); // 4 表示已完成
            task.setProgress(100);
            Task updatedTask = taskService.updateTask(task);

            return ApiResponse.success("任务完成成功", updatedTask);
        } catch (Exception e) {
            log.error("完成任务失败", e);
            return ApiResponse.error("完成任务失败: " + e.getMessage());
        }
    }

    // 获取最近的任务
    @GetMapping("/recent")
    public ApiResponse<List<Task>> getRecentTasks() {
        try {
            List<Task> recentTasks = taskService.getRecentTasks();
            return ApiResponse.success(recentTasks);
        } catch (Exception e) {
            log.error("获取最近任务失败", e);
            return ApiResponse.error("获取最近任务失败: " + e.getMessage());
        }
    }
}