package com.example.demo.mapper;

import com.example.demo.model.Team;
import com.example.demo.model.TeamMember;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface TeamMapper {

    @Select("SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.joined_at, " +
            "u.id as user_id, u.username, u.email, u.avatar, u.contact_info, u.position " +
            "FROM team_members tm " +
            "JOIN users u ON tm.user_id = u.id " +
            "WHERE tm.team_id = #{teamId} " +
            "AND (#{keyword} = '' OR u.username LIKE CONCAT('%',#{keyword},'%') OR u.name LIKE CONCAT('%',#{keyword},'%')) " +
            "LIMIT #{size} OFFSET #{offset}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "teamId", column = "team_id"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "role", column = "role"),
            @Result(property = "joinedAt", column = "joined_at"),
            @Result(property = "user.id", column = "user_id"),
            @Result(property = "user.username", column = "username"),
            @Result(property = "user.email", column = "email"),
            @Result(property = "user.avatar", column = "avatar"),
            @Result(property = "user.contactInfo", column = "contact_info"),
            @Result(property = "user.position", column = "position")
    })
    List<TeamMember> selectMembersByTeam(@Param("teamId") Long teamId,
                                         @Param("keyword") String keyword,
                                         @Param("offset") int offset,
                                         @Param("size") int size);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("INSERT INTO teams(name, description, organizer_id, created_at, updated_at) " +
            "VALUES(#{name}, #{description}, #{organizerId}, NOW(), NOW())")
    void insert(Team team);

    // 修复的查询：查询用户所有团队（作为组织者或成员），并返回角色信息和成员数量
    @Select("SELECT t.*, " +
            "(SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as memberCount, " +
            "CASE " +
            "    WHEN t.organizer_id = #{userId} THEN 'admin' " +
            "    ELSE (SELECT tm.role FROM team_members tm WHERE tm.team_id = t.id AND tm.user_id = #{userId}) " +
            "END as role " +
            "FROM teams t " +
            "WHERE t.organizer_id = #{userId} " +
            "OR EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = t.id AND tm.user_id = #{userId}) " +
            "ORDER BY t.id")
    List<Team> selectTeamsByUserId(@Param("userId") Long userId);


    @Select("SELECT tm.id, tm.team_id, tm.user_id, tm.role, tm.joined_at, " +
            "u.id as user_id, u.username, u.email, u.avatar, u.contact_info, u.position " +
            "FROM team_members tm " +
            "JOIN users u ON tm.user_id = u.id " +
            "WHERE tm.team_id = #{teamId} AND tm.id = #{memberId}")  // 修改这里
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "teamId", column = "team_id"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "role", column = "role"),
            @Result(property = "joinedAt", column = "joined_at"),
            @Result(property = "user.id", column = "user_id"),
            @Result(property = "user.username", column = "username"),
            @Result(property = "user.email", column = "email"),
            @Result(property = "user.avatar", column = "avatar"),
            @Result(property = "user.contactInfo", column = "contact_info"),
            @Result(property = "user.position", column = "position")
    })
    TeamMember selectMemberDetail(@Param("teamId") Long teamId, @Param("memberId") Long memberId);

    @Select("SELECT * FROM teams WHERE id = #{teamId}")
    Team selectTeamById(@Param("teamId") Long teamId);

    // 检查用户是否团队成员
    @Select("SELECT COUNT(*) FROM team_members WHERE team_id = #{teamId} AND user_id = #{userId}")
    int countTeamMember(@Param("teamId") Long teamId, @Param("userId") Long userId);

    // 获取团队成员总数
    @Select("SELECT COUNT(*) FROM team_members WHERE team_id = #{teamId}")
    int countAllTeamMembers(@Param("teamId") Long teamId);

    // 更新团队信息
    @Update("UPDATE teams SET name = #{name}, description = #{description}, updated_at = NOW() WHERE id = #{id}")
    boolean update(Team team);

    // 删除团队
    @Delete("DELETE FROM teams WHERE id = #{teamId}")
    boolean delete(Long teamId);

    // 添加团队成员
    @Insert("INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (#{teamId}, #{userId}, 'member', NOW())")
    boolean insertTeamMember(@Param("teamId") Long teamId, @Param("userId") Long userId);

    // 移除团队成员
    @Delete("DELETE FROM team_members WHERE team_id = #{teamId} AND user_id = #{memberId}")
    boolean deleteTeamMember(@Param("teamId") Long teamId, @Param("memberId") Long memberId);

    // 删除团队的所有成员
    @Delete("DELETE FROM team_members WHERE team_id = #{teamId}")
    boolean deleteAllTeamMembers(@Param("teamId") Long teamId);

    // 获取所有团队
    @Select("SELECT * FROM teams ORDER BY id")
    List<Team> selectAllTeams();
}