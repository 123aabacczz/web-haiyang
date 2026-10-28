package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.TeamActivities;
import com.example.demo.model.User;
import com.example.demo.service.TeamActivitiesService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-activities")
@RequiredArgsConstructor
public class TeamActivitiesController {

    private final TeamActivitiesService teamActivitiesService;

    private User getUserFromSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute("user");
    }

    // 获取团队动态列表
    @GetMapping("/team/{teamId}")
    public ApiResponse<List<TeamActivities>> getTeamActivitiesByTeamId(@PathVariable("teamId") Long teamId, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        List<TeamActivities> teamActivities = teamActivitiesService.getTeamActivitiesByTeamId(teamId);
        return ApiResponse.success(teamActivities);
    }

    // 创建团队动态
    @PostMapping
    public ApiResponse<Long> createTeamActivity(@RequestBody TeamActivities teamActivities, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        teamActivities.setCreatedBy(user.getId());
        Long id = teamActivitiesService.createTeamActivity(teamActivities);
        return ApiResponse.success(id);
    }

    // 删除团队动态
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteTeamActivity(@PathVariable("id") Long id, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        boolean success = teamActivitiesService.deleteTeamActivity(id);
        return ApiResponse.success(success);
    }
}
