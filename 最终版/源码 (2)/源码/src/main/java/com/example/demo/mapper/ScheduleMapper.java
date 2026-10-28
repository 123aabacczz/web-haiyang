package com.example.demo.mapper;

import com.example.demo.model.Schedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ScheduleMapper {

    /**
     * 根据用户ID和时间范围查询日程
     */
    List<Schedule> selectByUserIdAndDateRange(
            @Param("userId") Long userId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    /**
     * 查询用户的近期日程
     */
    List<Schedule> selectUpcomingSchedules(
            @Param("userId") Long userId,
            @Param("startTime") LocalDateTime startTime,
            @Param("limit") Integer limit);

    /**
     * 根据ID查询日程
     */
    Schedule selectById(@Param("id") Long id);

    /**
     * 插入新日程
     */
    int insert(Schedule schedule);

    /**
     * 更新日程
     */
    int update(Schedule schedule);

    /**
     * 删除日程
     */
    int deleteById(@Param("id") Long id);

    /**
     * 检查日程是否属于指定用户
     */
    boolean existsByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    /**
     * 根据用户ID和类型查询日程
     */
    List<Schedule> selectByUserIdAndType(
            @Param("userId") Long userId,
            @Param("type") String type);

    /**
     * 根据用户ID查询所有日程
     */
    List<Schedule> selectByUserId(@Param("userId") Long userId);

    // ScheduleMapper.java 中添加
    List<Schedule> selectByDateRange(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    List<Schedule> selectUpcomingSchedules(
            @Param("startTime") LocalDateTime startTime,
            @Param("limit") Integer limit);
}