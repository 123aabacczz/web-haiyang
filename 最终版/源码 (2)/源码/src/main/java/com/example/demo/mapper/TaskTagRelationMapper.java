package com.example.demo.mapper;

import com.example.demo.dto.TaskTagStats;
import org.apache.ibatis.annotations.*;

import java.util.List;
import java.util.Map;

@Mapper
public interface TaskTagRelationMapper {

    // 使用明确的结果类型，避免使用 Map
    @Select("SELECT id, tag_name as tagName, visit_count as visitCount, last_visited as lastVisited FROM task_tag_stats ORDER BY visit_count DESC")
    List<TaskTagStats> findTaskTagStats();

    // 其他方法保持不变
    @Select("SELECT ttr.task_id as taskId, ttr.task_tag_stats_id as tagId, tts.tag_name as tagName " +
            "FROM task_tag ttr " +
            "JOIN task_tag_stats tts ON ttr.task_tag_stats_id = tts.id " +
            "ORDER BY ttr.task_id, ttr.task_tag_stats_id")
    List<Map<String, Object>> findAllTaskTagRelations();

    @Select("SELECT tts.id, tts.tag_name as tagName, tts.visit_count as visitCount " +
            "FROM task_tag ttr " +
            "JOIN task_tag_stats tts ON ttr.task_tag_stats_id = tts.id " +
            "WHERE ttr.task_id = #{taskId}")
    List<Map<String, Object>> findTagsByTaskId(@Param("taskId") Long taskId);
}