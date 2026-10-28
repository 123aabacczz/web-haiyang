package com.example.demo.mapper;

import com.example.demo.model.TeamActivities;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface TeamActivitiesMapper {

    @Select("SELECT ta.id, ta.team_id, ta.type, ta.title, ta.description, ta.created_at, ta.created_by, " +
            "u.id as user_id, u.username as user_username, u.avatar as user_avatar " +
            "FROM team_activities ta " +
            "LEFT JOIN users u ON ta.created_by = u.id " +
            "WHERE ta.team_id = #{teamId} ORDER BY ta.created_at DESC")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "teamId", column = "team_id"),
            @Result(property = "type", column = "type"),
            @Result(property = "title", column = "title"),
            @Result(property = "description", column = "description"),
            @Result(property = "createdAt", column = "created_at"),
            @Result(property = "createdBy", column = "created_by"),
            @Result(property = "creator.id", column = "user_id"),
            @Result(property = "creator.username", column = "user_username"),
            @Result(property = "creator.avatar", column = "user_avatar")
    })
    List<TeamActivities> selectByTeamId(@Param("teamId") Long teamId);

    @Select("SELECT ta.*, u.* FROM team_activities ta " +
            "LEFT JOIN users u ON ta.created_by = u.id " +
            "WHERE ta.id = #{id}")
    @Results({
            @Result(property = "id", column = "ta.id"),
            @Result(property = "teamId", column = "ta.team_id"),
            @Result(property = "type", column = "ta.type"),
            @Result(property = "title", column = "ta.title"),
            @Result(property = "description", column = "ta.description"),
            @Result(property = "createdAt", column = "ta.created_at"),
            @Result(property = "createdBy", column = "ta.created_by"),
            @Result(property = "creator.id", column = "u.id"),
            @Result(property = "creator.username", column = "u.username"),
            @Result(property = "creator.avatar", column = "u.avatar")
    })
    TeamActivities selectById(@Param("id") Long id);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("INSERT INTO team_activities(team_id, type, title, description, created_at, created_by) " +
            "VALUES(#{teamId}, #{type}, #{title}, #{description}, NOW(), #{createdBy})")
    void insert(TeamActivities teamActivities);

    @Delete("DELETE FROM team_activities WHERE id = #{id}")
    boolean delete(@Param("id") Long id);

    @Delete("DELETE FROM team_activities WHERE team_id = #{teamId}")
    boolean deleteByTeamId(@Param("teamId") Long teamId);
}
