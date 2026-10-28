// TaskTagRelationServiceImpl.java
package com.example.demo.service;

import com.example.demo.dto.TaskTagStats;
import com.example.demo.mapper.TaskTagRelationMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class TaskTagRelationServiceImpl implements TaskTagRelationService {

    @Autowired
    private TaskTagRelationMapper taskTagRelationMapper;

    @Override
    public List<Map<String, Object>> getAllTaskTagRelations() {
        return taskTagRelationMapper.findAllTaskTagRelations();
    }

    @Override
    public List<Map<String, Object>> getTagsByTaskId(Long taskId) {
        return taskTagRelationMapper.findTagsByTaskId(taskId);
    }

    @Override
    public List<TaskTagStats> getTaskTagStats() { // 修改返回类型
        List<TaskTagStats> tags = taskTagRelationMapper.findTaskTagStats();
        log.info("获取到的标签统计数据数量: {}", tags.size());

        // 详细调试信息
        for (int i = 0; i < Math.min(tags.size(), 3); i++) {
            TaskTagStats tag = tags.get(i);
            log.info("第{}个标签数据: id={}, tagName={}, visitCount={}, lastVisited={}",
                    i + 1, tag.getId(), tag.getTagName(), tag.getVisitCount(), tag.getLastVisited());
        }
        return tags;
    }
}