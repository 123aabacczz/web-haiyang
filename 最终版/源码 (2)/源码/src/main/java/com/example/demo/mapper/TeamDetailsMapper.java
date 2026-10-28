package com.example.demo.mapper;

import com.example.demo.model.TeamDetails;
import org.apache.ibatis.annotations.*;

@Mapper
public interface TeamDetailsMapper {

    @Select("SELECT * FROM team_details WHERE team_id = #{teamId}")
    TeamDetails selectByTeamId(@Param("teamId") Long teamId);

    @Select("SELECT * FROM team_details WHERE id = #{id}")
    TeamDetails selectById(@Param("id") Long id);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("INSERT INTO team_details(team_id, establish_date, goal, location, tags, member_count, activity_rate, type, last_updated) " +
            "VALUES(#{teamId}, #{establishDate}, #{goal}, #{location}, #{tags}, #{memberCount}, #{activityRate}, #{type}, NOW())")
    void insert(TeamDetails teamDetails);

    @Update("UPDATE team_details SET establish_date = #{establishDate}, goal = #{goal}, location = #{location}, " +
            "tags = #{tags}, member_count = #{memberCount}, activity_rate = #{activityRate}, type = #{type}, last_updated = NOW() " +
            "WHERE team_id = #{teamId}")
    boolean update(TeamDetails teamDetails);

    @Delete("DELETE FROM team_details WHERE team_id = #{teamId}")
    boolean deleteByTeamId(@Param("teamId") Long teamId);
}
