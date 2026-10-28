package com.example.demo.mapper;

import com.example.demo.model.OrganizationMembers;
import com.example.demo.model.TeamMember;
import com.example.demo.model.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface OrganizationMembersMapper {

    @Select("SELECT om.*, tm.id as tm_id, tm.team_id, tm.user_id, tm.role, tm.joined_at as tm_joined_at, " +
            "u.id as u_id, u.username, u.email, u.avatar, u.contact_info, u.position as user_position " +
            "FROM organization_members om " +
            "LEFT JOIN team_members tm ON om.team_member_id = tm.id " +
            "LEFT JOIN users u ON tm.user_id = u.id " +
            "WHERE om.org_id = #{orgId}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "orgId", column = "org_id"),
            @Result(property = "teamMemberId", column = "team_member_id"),
            @Result(property = "position", column = "position"),
            @Result(property = "joinedAt", column = "joined_at"),
            @Result(property = "teamMember.id", column = "tm_id"),
            @Result(property = "teamMember.teamId", column = "team_id"),
            @Result(property = "teamMember.userId", column = "user_id"),
            @Result(property = "teamMember.role", column = "role"),
            @Result(property = "teamMember.joinedAt", column = "tm_joined_at"),
            @Result(property = "teamMember.user.id", column = "u_id"),
            @Result(property = "teamMember.user.username", column = "username"),
            @Result(property = "teamMember.user.email", column = "email"),
            @Result(property = "teamMember.user.avatar", column = "avatar"),
            @Result(property = "teamMember.user.contactInfo", column = "contact_info"),
            @Result(property = "teamMember.user.position", column = "user_position")
    })
    List<OrganizationMembers> selectByOrgId(@Param("orgId") Long orgId);

    @Select("SELECT om.*, tm.id as tm_id, tm.team_id, tm.user_id, tm.role, tm.joined_at as tm_joined_at, " +
            "u.id as u_id, u.username, u.email, u.avatar, u.contact_info, u.position as user_position " +
            "FROM organization_members om " +
            "LEFT JOIN team_members tm ON om.team_member_id = tm.id " +
            "LEFT JOIN users u ON tm.user_id = u.id " +
            "WHERE om.org_id = #{orgId} AND om.team_member_id = #{teamMemberId}")
    @Results({
            @Result(property = "id", column = "id"),
            @Result(property = "orgId", column = "org_id"),
            @Result(property = "teamMemberId", column = "team_member_id"),
            @Result(property = "position", column = "position"),
            @Result(property = "joinedAt", column = "joined_at"),
            @Result(property = "teamMember.id", column = "tm_id"),
            @Result(property = "teamMember.teamId", column = "team_id"),
            @Result(property = "teamMember.userId", column = "user_id"),
            @Result(property = "teamMember.role", column = "role"),
            @Result(property = "teamMember.joinedAt", column = "tm_joined_at"),
            @Result(property = "teamMember.user.id", column = "u_id"),
            @Result(property = "teamMember.user.username", column = "username"),
            @Result(property = "teamMember.user.email", column = "email"),
            @Result(property = "teamMember.user.avatar", column = "avatar"),
            @Result(property = "teamMember.user.contactInfo", column = "contact_info"),
            @Result(property = "teamMember.user.position", column = "user_position")
    })
    OrganizationMembers selectByOrgIdAndTeamMemberId(@Param("orgId") Long orgId, @Param("teamMemberId") Long teamMemberId);

    @Options(useGeneratedKeys = true, keyProperty = "id")
    @Insert("INSERT INTO organization_members(org_id, team_member_id, position, joined_at) " +
            "VALUES(#{orgId}, #{teamMemberId}, #{position}, NOW())")
    void insert(OrganizationMembers organizationMembers);

    @Update("UPDATE organization_members SET position = #{position} WHERE id = #{id}")
    boolean update(OrganizationMembers organizationMembers);

    @Delete("DELETE FROM organization_members WHERE id = #{id}")
    boolean delete(@Param("id") Long id);

    @Delete("DELETE FROM organization_members WHERE org_id = #{orgId}")
    boolean deleteByOrgId(@Param("orgId") Long orgId);

    @Delete("DELETE FROM organization_members WHERE team_member_id = #{teamMemberId}")
    boolean deleteByTeamMemberId(@Param("teamMemberId") Long teamMemberId);
}
