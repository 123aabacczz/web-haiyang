// TaskServiceImpl.java
package com.example.demo.service;

import com.example.demo.mapper.TaskMapper;
import com.example.demo.model.Admin;
import com.example.demo.model.Task;
import com.example.demo.util.PageInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TaskServiceImpl implements TaskService {
    @Autowired
    private TaskMapper taskMapper;

    @Autowired
    private ActivityLogService activityLogService;

    private Admin admin;

    @Override
    public Task getTaskById(Long id) {
        return taskMapper.findById(id);
    }

    @Override
    public List<Map<String, Object>> getAdminUsers() {
        return taskMapper.findAdminUsers();
    }

    @Override
    public PageInfo<Task> getTasks(Integer status, Integer priority, String keyword, Integer page, Integer size) {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;

        int offset = (page - 1) * size;

        Map<String, Object> params = new HashMap<>();
        params.put("status", status);
        params.put("priority", priority);
        params.put("keyword", keyword);
        params.put("offset", offset);
        params.put("pageSize", size);

        List<Task> tasks = taskMapper.findTasks(params);
        int total = taskMapper.countTasks(params);

        PageInfo<Task> pageInfo = new PageInfo<>();
        pageInfo.setItems(tasks);
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);

        return pageInfo;
    }

    @Override
    public PageInfo<Task> getPendingTasks(Integer page, Integer size) {
        if (page == null || page < 1) page = 1;
        if (size == null || size < 1) size = 10;

        int offset = (page - 1) * size;
        List<Task> tasks = taskMapper.findPendingTasks(offset, size);
        int total = taskMapper.countPendingTasks();

        PageInfo<Task> pageInfo = new PageInfo<>();
        pageInfo.setItems(tasks);
        pageInfo.setCurrentPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);

        return pageInfo;
    }

    @Override
    @Transactional
    public Task createTask(Task task) {
        log.info("开始执行createTask，任务信息: {}", task);
        
        task.setCreateTime(LocalDateTime.now());
        task.setUpdateTime(LocalDateTime.now());
        task.setStatus(0);
        task.setIsDeleted(0);

        if (task.getProgress() == null) {
            task.setProgress(0);
            log.info("设置默认进度为0");
        }

        if (task.getReward() == null) {
            task.setReward(10); // 默认奖励值为10
            log.info("设置默认奖励值为10");
        }

        log.info("准备插入任务到数据库");
        int result = taskMapper.insert(task);
        log.info("插入任务结果: {}, 生成ID: {}", result, task.getId());

        log.info("记录活动日志");
        activityLogService.logActivity("CREATE_TASK", "TASK", task.getId(),
                "创建任务: " + task.getTitle());

        log.info("任务创建完成，返回任务对象: {}", task);
        return task;
    }

    @Override
    @Transactional
    public Task updateTask(Task task) {
        Task existingTask = taskMapper.findById(task.getId());
        if (existingTask == null) {
            throw new RuntimeException("任务不存在");
        }

        task.setUpdateTime(LocalDateTime.now());
        taskMapper.update(task);

        activityLogService.logActivity("UPDATE_TASK", "TASK", task.getId(),
                "更新任务: " + task.getTitle());

        return taskMapper.findById(task.getId());
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        Task task = taskMapper.findById(id);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        taskMapper.deleteById(id);

        activityLogService.logActivity("DELETE_TASK", "TASK", id,
                "删除任务: " + task.getTitle());
    }

    @Override
    @Transactional
    public Task reviewTask(Long taskId, Integer status, Long reviewerId, String reviewComment) {
        Task task = taskMapper.findById(taskId);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }

        if (!status.equals(1) && !status.equals(2)) {
            throw new RuntimeException("审核状态无效");
        }

        taskMapper.reviewTask(taskId, status, reviewerId, reviewComment);

        String actionType = status.equals(1) ? "APPROVE_TASK" : "REJECT_TASK";
        String description = "审核任务: " + task.getTitle() + ", 结果: " +
                (status.equals(1) ? "通过" : "拒绝") +
                (reviewComment != null ? ", 备注: " + reviewComment : "");

        activityLogService.logActivity(actionType, "TASK", taskId, description, "AUDIT");

        return taskMapper.findById(taskId);
    }

    @Override
    public List<Task> getTasksByAssignee(Long assigneeId) {
        Map<String, Object> params = new HashMap<>();
        params.put("assigneeId", assigneeId);
        return taskMapper.findTasks(params);
    }

    // 添加缺失的方法实现
    @Override
    public List<Task> getRecentTasks() {
        return taskMapper.selectRecentTasks();
    }
}