// TaskService.java (接口)
package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.util.PageInfo;

import java.util.List;
import java.util.Map;

public interface TaskService {
    Task getTaskById(Long id);
    PageInfo<Task> getTasks(Integer status, Integer priority, String keyword, Integer page, Integer size);
    PageInfo<Task> getPendingTasks(Integer page, Integer size);
    Task createTask(Task task);
    Task updateTask(Task task);
    void deleteTask(Long id);
    Task reviewTask(Long taskId, Integer status, Long reviewerId, String reviewComment);
    List<Task> getTasksByAssignee(Long assigneeId);
    List<Map<String, Object>> getAdminUsers();
    // 添加缺失的方法
    List<Task> getRecentTasks();
}