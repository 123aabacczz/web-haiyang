package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.dto.TaskTagStats;
import com.example.demo.service.TaskTagRelationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Slf4j
public class TaskTagRelationController {

    @Autowired
    private TaskTagRelationService taskTagRelationService;

    // 在 TaskTagRelationController.java 中确保返回正确格式
    @GetMapping("/task_tag_stats")
    public ApiResponse<List<TaskTagStats>> getTaskTagStats() { // 修改返回类型
        try {
            List<TaskTagStats> tags = taskTagRelationService.getTaskTagStats();
            log.info("返回的标签数据数量: {}", tags.size());

            if (!tags.isEmpty()) {
                TaskTagStats firstTag = tags.get(0);
                log.info("第一个标签数据: id={}, tagName={}, visitCount={}, lastVisited={}",
                        firstTag.getId(), firstTag.getTagName(), firstTag.getVisitCount(), firstTag.getLastVisited());
            }

            return ApiResponse.success(tags); // 直接返回对象列表
        } catch (Exception e) {
            log.error("获取任务标签统计失败", e);
            return ApiResponse.error("获取任务标签统计失败: " + e.getMessage());
        }
    }

    // 根据任务ID获取标签
    @GetMapping("/tasks/{taskId}/tags")
    public ApiResponse<List<Map<String, Object>>> getTagsByTaskId(@PathVariable Long taskId) {
        try {
            List<Map<String, Object>> tags = taskTagRelationService.getTagsByTaskId(taskId);
            return ApiResponse.success(tags);
        } catch (Exception e) {
            log.error("获取任务标签失败", e);
            return ApiResponse.error("获取任务标签失败: " + e.getMessage());
        }
    }

    // 获取所有任务标签关系
    @GetMapping("/task-tag-relations")
    public ApiResponse<List<Map<String, Object>>> getAllTaskTagRelations() {
        try {
            List<Map<String, Object>> relations = taskTagRelationService.getAllTaskTagRelations();
            return ApiResponse.success(relations);
        } catch (Exception e) {
            log.error("获取任务标签关系失败", e);
            return ApiResponse.error("获取任务标签关系失败: " + e.getMessage());
        }
    }
}