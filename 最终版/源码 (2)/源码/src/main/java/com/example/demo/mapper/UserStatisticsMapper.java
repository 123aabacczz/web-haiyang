package com.example.demo.mapper;

import com.example.demo.model.UserStatistics;
import org.apache.ibatis.annotations.*;

@Mapper
public interface UserStatisticsMapper {

    @Insert("INSERT INTO user_statistics (user_id, projects_count, documents_count, skills_count, work_years, created_at, updated_at) " +
            "VALUES (#{userId}, #{projectsCount}, #{documentsCount}, #{skillsCount}, #{workYears}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(UserStatistics userStatistics);

    @Select("SELECT * FROM user_statistics WHERE user_id = #{userId}")
    UserStatistics selectByUserId(@Param("userId") Long userId);

    @Update("UPDATE user_statistics SET projects_count = #{projectsCount}, documents_count = #{documentsCount}, " +
            "skills_count = #{skillsCount}, work_years = #{workYears}, updated_at = #{updatedAt} WHERE user_id = #{userId}")
    int updateByUserId(UserStatistics userStatistics);

    @Delete("DELETE FROM user_statistics WHERE user_id = #{userId}")
    int deleteByUserId(@Param("userId") Long userId);
}