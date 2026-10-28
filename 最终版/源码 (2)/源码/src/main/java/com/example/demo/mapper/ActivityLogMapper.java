package com.example.demo.mapper;

import com.example.demo.model.ActivityLog;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ActivityLogMapper {

    void insert(ActivityLog log);

    List<ActivityLog> selectRecent(@Param("limit") int limit);

    // 新增分页查询方法
    List<ActivityLog> selectPage(@Param("offset") int offset, @Param("limit") int limit);

    long count();

    @Select("SELECT COUNT(*) FROM activity_logs " +
            "WHERE action_type = #{actionType} " +
            "AND target_type = #{targetType} " +
            "AND target_id = #{targetId} " +
            "AND description = #{description} " +
            "AND action_time >= NOW() - INTERVAL 5 MINUTE")
    int existsSimilarLog(String actionType, String targetType,
                         Long targetId, String description);

    @Select("SELECT * FROM activity_logs WHERE id = #{id}")
    ActivityLog selectById(Long id);

    @Delete("DELETE FROM activity_logs WHERE id = #{id}")
    void deleteById(Long id);
}