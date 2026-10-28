package com.example.demo.mapper;

import com.example.demo.model.UserWeeklyOverview;
import org.apache.ibatis.annotations.*;
import java.time.LocalDate;

@Mapper
public interface UserWeeklyOverviewMapper {

    @Insert("INSERT INTO user_weekly_overviews (user_id, week_start_date, week_end_date, documents_created, tasks_in_progress, " +
            "comments_count, study_time_minutes, documents_trend, tasks_trend, comments_trend, study_time_trend, created_at) " +
            "VALUES (#{userId}, #{weekStartDate}, #{weekEndDate}, #{documentsCreated}, #{tasksInProgress}, " +
            "#{commentsCount}, #{studyTimeMinutes}, #{documentsTrend}, #{tasksTrend}, #{commentsTrend}, #{studyTimeTrend}, #{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(UserWeeklyOverview overview);

    @Select("SELECT * FROM user_weekly_overviews WHERE user_id = #{userId} AND week_start_date = #{weekStartDate}")
    UserWeeklyOverview selectByUserIdAndWeekStart(@Param("userId") Long userId, @Param("weekStartDate") LocalDate weekStartDate);

    @Update("UPDATE user_weekly_overviews SET documents_created = #{documentsCreated}, tasks_in_progress = #{tasksInProgress}, " +
            "comments_count = #{commentsCount}, study_time_minutes = #{studyTimeMinutes}, documents_trend = #{documentsTrend}, " +
            "tasks_trend = #{tasksTrend}, comments_trend = #{commentsTrend}, study_time_trend = #{studyTimeTrend} " +
            "WHERE user_id = #{userId} AND week_start_date = #{weekStartDate}")
    int updateByUserIdAndWeekStart(UserWeeklyOverview overview);

    @Select("SELECT * FROM user_weekly_overviews WHERE user_id = #{userId} ORDER BY week_start_date DESC LIMIT 1")
    UserWeeklyOverview selectLatestByUserId(@Param("userId") Long userId);
}