package com.example.demo.service;

import com.example.demo.mapper.TeamMapper;
import com.example.demo.model.Team;
import com.example.demo.model.TeamMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamMapper teamMapper;

    public List<TeamMember> listMembers(Long teamId, String keyword, int page, int size) {
        int offset = (page - 1) * size;
        return teamMapper.selectMembersByTeam(teamId, keyword, offset, size);
    }

    public TeamMember getMemberDetail(Long teamId, Long memberId) {
        return teamMapper.selectMemberDetail(teamId, memberId);
    }

    public Long create(Team team) {
        teamMapper.insert(team);
        return team.getId();
    }

    public List<Team> getTeamsByUserId(Long userId) {
        return teamMapper.selectTeamsByUserId(userId);
    }

    public Team getTeamById(Long teamId) {
        return teamMapper.selectTeamById(teamId);
    }

    public boolean hasAccessToTeam(Long teamId, Long userId) {
        // 检查用户是否是团队组织者或成员
        Team team = getTeamById(teamId);
        if (team == null) {
            return false;
        }

        // 检查organizerId是否为null，如果为null则不能调用equals方法
        Long organizerId = team.getOrganizerId();
        if (organizerId != null && organizerId.equals(userId)) {
            return true;
        }

        // 直接查询计数
        return teamMapper.countTeamMember(teamId, userId) > 0;
    }

    public List<Team> getUserTeams(Long userId) {
        return teamMapper.selectTeamsByUserId(userId);
    }

    public List<TeamMember> getTeamMembers(Long teamId, String keyword, int page, int size) {
        int offset = (page - 1) * size;
        return teamMapper.selectMembersByTeam(teamId, keyword, offset, size);
    }

    public boolean isTeamMember(Long teamId, Long userId) {
        return teamMapper.countTeamMember(teamId, userId) > 0;
    }

    // 更新团队信息
    public boolean updateTeam(Team team) {
        return teamMapper.update(team);
    }

    // 删除团队（包含事务处理）
    @Transactional
    public boolean deleteTeam(Long teamId) {
        try {
            // 先删除团队成员
            teamMapper.deleteAllTeamMembers(teamId);
            // 再删除团队
            return teamMapper.delete(teamId);
        } catch (Exception e) {
            throw new RuntimeException("删除团队失败: " + e.getMessage(), e);
        }
    }

    // 获取团队成员总数
    public int countTeamMembers(Long teamId) {
        return teamMapper.countAllTeamMembers(teamId);
    }

    // 添加团队成员
    public boolean addTeamMember(Long teamId, Long userId) {
        // 检查是否已经是团队成员
        if (teamMapper.countTeamMember(teamId, userId) > 0) {
            return false; // 已经是团队成员
        }

        return teamMapper.insertTeamMember(teamId, userId);
    }

    // 移除团队成员
    public boolean removeTeamMember(Long teamId, Long memberId) {
        return teamMapper.deleteTeamMember(teamId, memberId);
    }

    // 获取所有团队（用于可加入的团队列表）
    public List<Team> getAllTeams() {
        // 这里需要实现获取所有团队的逻辑
        // 暂时返回空列表，实际应该从数据库查询
        return teamMapper.selectAllTeams();
    }
}
