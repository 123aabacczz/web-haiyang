package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Team;
import com.example.demo.model.TeamMember;
import com.example.demo.model.User;
import com.example.demo.service.TeamService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    private User getUserFromSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute("user");
    }

    // 获取用户的所有团队
    @GetMapping("/my-teams")
    public ApiResponse<List<Team>> getMyTeams(HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        List<Team> teams = teamService.getTeamsByUserId(user.getId());
        return ApiResponse.success(teams);
    }

    // 获取团队详情
    @GetMapping("/{teamId}")
    public ApiResponse<Team> getTeam(@PathVariable("teamId") Long teamId,
                                     HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        if (!teamService.hasAccessToTeam(teamId, user.getId())) {
            return ApiResponse.error("无权限访问该团队");
        }
        Team team = teamService.getTeamById(teamId);
        return ApiResponse.success(team);
    }

    // 创建团队
    @PostMapping
    public ApiResponse<Long> create(@RequestBody Team team,
                                    HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        team.setOrganizerId(user.getId());
        Long id = teamService.create(team);
        return ApiResponse.success(id);
    }

    // 更新团队信息
    @PutMapping("/{teamId}")
    public ApiResponse<Boolean> updateTeam(@PathVariable("teamId") Long teamId,
                                           @RequestBody Team team,
                                           HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        // 检查用户是否是团队组织者
        Team existingTeam = teamService.getTeamById(teamId);
        if (existingTeam == null) {
            return ApiResponse.error("团队不存在");
        }

        if (!existingTeam.getOrganizerId().equals(user.getId())) {
            return ApiResponse.error("只有团队组织者可以修改团队信息");
        }

        team.setId(teamId);
        boolean success = teamService.updateTeam(team);
        return ApiResponse.success(success);
    }

    // 删除团队
    @DeleteMapping("/{teamId}")
    public ApiResponse<Boolean> deleteTeam(@PathVariable("teamId") Long teamId,
                                           HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        // 检查用户是否是团队组织者
        Team team = teamService.getTeamById(teamId);
        if (team == null) {
            return ApiResponse.error("团队不存在");
        }

        if (!team.getOrganizerId().equals(user.getId())) {
            return ApiResponse.error("只有团队组织者可以删除团队");
        }

        boolean success = teamService.deleteTeam(teamId);
        return ApiResponse.success(success);
    }

    // 获取团队成员列表
    @GetMapping("/{teamId}/members")
    public ApiResponse<Map<String, Object>> getTeamMembers(
            @PathVariable("teamId") Long teamId,
            @RequestParam(value = "keyword", defaultValue = "") String keyword,
            @RequestParam(value = "page", defaultValue = "1") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        if (!teamService.hasAccessToTeam(teamId, user.getId())) {
            return ApiResponse.error("无权限访问该团队");
        }

        List<TeamMember> members = teamService.listMembers(teamId, keyword, page, size);
        int totalCount = teamService.countTeamMembers(teamId);
        int totalPages = (int) Math.ceil((double) totalCount / size);

        return ApiResponse.success(Map.of(
                "members", members,
                "totalCount", totalCount,
                "totalPages", totalPages,
                "currentPage", page
        ));
    }

    // 获取团队成员详情
    @GetMapping("/{teamId}/members/{memberId}")
    public ApiResponse<TeamMember> getMemberDetail(@PathVariable("teamId") Long teamId,
                                                   @PathVariable("memberId") Long memberId,
                                                   HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        if (!teamService.hasAccessToTeam(teamId, user.getId())) {
            return ApiResponse.error("无权限访问该团队");
        }

        TeamMember member = teamService.getMemberDetail(teamId, memberId);
        if (member == null) {
            return ApiResponse.error("团队成员不存在");
        }

        return ApiResponse.success(member);
    }

    // 添加团队成员
    @PostMapping("/{teamId}/members")
    public ApiResponse<Boolean> addTeamMember(@PathVariable("teamId") Long teamId,
                                              @RequestBody Map<String, Long> request,
                                              HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        // 检查用户是否是团队组织者
        Team team = teamService.getTeamById(teamId);
        if (team == null) {
            return ApiResponse.error("团队不存在");
        }

        if (!team.getOrganizerId().equals(user.getId())) {
            return ApiResponse.error("只有团队组织者可以添加成员");
        }

        Long userId = request.get("userId");
        if (userId == null) {
            return ApiResponse.error("用户ID不能为空");
        }

        boolean success = teamService.addTeamMember(teamId, userId);
        return ApiResponse.success(success);
    }

    // 移除团队成员
    @DeleteMapping("/{teamId}/members/{memberId}")
    public ApiResponse<Boolean> removeTeamMember(@PathVariable("teamId") Long teamId,
                                                 @PathVariable("memberId") Long memberId,
                                                 HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        // 检查用户是否是团队组织者
        Team team = teamService.getTeamById(teamId);
        if (team == null) {
            return ApiResponse.error("团队不存在");
        }

        if (!team.getOrganizerId().equals(user.getId())) {
            return ApiResponse.error("只有团队组织者可以移除成员");
        }

        // 不能移除自己（组织者）
        if (memberId.equals(user.getId())) {
            return ApiResponse.error("不能移除自己，请先转让组织者权限");
        }

        boolean success = teamService.removeTeamMember(teamId, memberId);
        return ApiResponse.success(success);
    }

    // 检查用户是否是团队成员
    @GetMapping("/{teamId}/is-member")
    public ApiResponse<Boolean> isTeamMember(@PathVariable("teamId") Long teamId,
                                             HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        boolean isMember = teamService.isTeamMember(teamId, user.getId());
        return ApiResponse.success(isMember);
    }

    // 加入团队
    @PostMapping("/join")
    public ApiResponse<Boolean> joinTeam(@RequestBody Map<String, Long> request,
                                         HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        Long teamId = request.get("team_id");
        if (teamId == null) {
            return ApiResponse.error("团队ID不能为空");
        }

        boolean success = teamService.addTeamMember(teamId, user.getId());
        return ApiResponse.success(success);
    }

    // 获取可加入的团队列表
    @GetMapping("/joinable")
    public ApiResponse<List<Team>> getJoinableTeams(HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }

        // 这里需要实现获取可加入的团队列表的逻辑
        // 暂时返回所有团队，实际应该根据团队的可见性和用户是否已经是成员来过滤
        List<Team> teams = teamService.getAllTeams();
        return ApiResponse.success(teams);
    }
} 