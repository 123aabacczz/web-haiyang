package com.example.demo.mapper;

import com.example.demo.model.TeamSettings;
import org.apache.ibatis.annotations.*;

@Mapper
public interface TeamSettingsMapper {

    @Select("SELECT ts.*, t.name, t.description FROM team_settings ts JOIN teams t ON ts.team_id = t.id WHERE ts.team_id = #{teamId}")
    TeamSettings selectByTeamId(@Param("teamId") Long teamId);

    @Select("SELECT * FROM team_settings WHERE id = #{id}")
    TeamSettings selectById(@Param("id") Long id);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("INSERT INTO team_settings(team_id, join_method, visibility, join_code, level_limit, updated_at) " +
            "VALUES(#{teamId}, #{joinMethod}, #{visibility}, #{joinCode}, #{levelLimit}, NOW())")
    void insert(TeamSettings teamSettings);

    @Update("UPDATE team_settings SET join_method = #{joinMethod}, visibility = #{visibility}, join_code = #{joinCode}, level_limit = #{levelLimit}, updated_at = NOW() WHERE team_id = #{teamId}")
    boolean updateTeamSettings(TeamSettings teamSettings);
    
    @Update("UPDATE teams SET name = #{name}, description = #{description}, updated_at = NOW() WHERE id = #{teamId}")
    boolean updateTeamInfo(TeamSettings teamSettings);

    @Delete("DELETE FROM team_settings WHERE team_id = #{teamId}")
    boolean deleteByTeamId(@Param("teamId") Long teamId);
}
