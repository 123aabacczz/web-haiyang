package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.TeamSettings;
import com.example.demo.model.User;
import com.example.demo.service.TeamSettingsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team-settings")
@RequiredArgsConstructor
public class TeamSettingsController {

    private final TeamSettingsService teamSettingsService;

    private User getUserFromSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute("user");
    }

    // 获取团队设置
    @GetMapping("/team/{teamId}")
    public ApiResponse<TeamSettings> getTeamSettingsByTeamId(@PathVariable("teamId") Long teamId, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        TeamSettings teamSettings = teamSettingsService.getTeamSettingsByTeamId(teamId);
        return ApiResponse.success(teamSettings);
    }

    // 创建团队设置
    @PostMapping
    public ApiResponse<Long> createTeamSettings(@RequestBody TeamSettings teamSettings, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        Long id = teamSettingsService.createTeamSettings(teamSettings);
        return ApiResponse.success(id);
    }

    // 更新团队设置
    @PutMapping("/team/{teamId}")
    public ApiResponse<Boolean> updateTeamSettings(@PathVariable("teamId") Long teamId, @RequestBody TeamSettings teamSettings, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        teamSettings.setTeamId(teamId);
        boolean success = teamSettingsService.updateTeamSettings(teamSettings);
        return ApiResponse.success(success);
    }

    // 删除团队设置
    @DeleteMapping("/team/{teamId}")
    public ApiResponse<Boolean> deleteTeamSettingsByTeamId(@PathVariable("teamId") Long teamId, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        boolean success = teamSettingsService.deleteTeamSettingsByTeamId(teamId);
        return ApiResponse.success(success);
    }
}
