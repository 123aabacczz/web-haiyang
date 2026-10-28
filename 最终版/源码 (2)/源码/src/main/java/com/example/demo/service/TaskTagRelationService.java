package com.example.demo.service;

import com.example.demo.dto.TaskTagStats;
import java.util.List;
import java.util.Map;

public interface TaskTagRelationService {
    List<Map<String, Object>> getAllTaskTagRelations();
    List<Map<String, Object>> getTagsByTaskId(Long taskId);
    List<TaskTagStats> getTaskTagStats(); // 修改返回类型
}