package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.TeamDetails;
import com.example.demo.model.User;
import com.example.demo.service.TeamDetailsService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team-details")
@RequiredArgsConstructor
public class TeamDetailsController {

    private final TeamDetailsService teamDetailsService;

    private User getUserFromSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute("user");
    }

    // 获取团队详情
    @GetMapping("/team/{teamId}")
    public ApiResponse<TeamDetails> getTeamDetailsByTeamId(@PathVariable("teamId") Long teamId, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        TeamDetails teamDetails = teamDetailsService.getTeamDetailsByTeamId(teamId);
        return ApiResponse.success(teamDetails);
    }

    // 创建团队详情
    @PostMapping
    public ApiResponse<Long> createTeamDetails(@RequestBody TeamDetails teamDetails, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        Long id = teamDetailsService.createTeamDetails(teamDetails);
        return ApiResponse.success(id);
    }

    // 更新团队详情
    @PutMapping("/team/{teamId}")
    public ApiResponse<Boolean> updateTeamDetails(@PathVariable("teamId") Long teamId, @RequestBody TeamDetails teamDetails, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        teamDetails.setTeamId(teamId);
        boolean success = teamDetailsService.updateTeamDetails(teamDetails);
        return ApiResponse.success(success);
    }

    // 删除团队详情
    @DeleteMapping("/team/{teamId}")
    public ApiResponse<Boolean> deleteTeamDetailsByTeamId(@PathVariable("teamId") Long teamId, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        boolean success = teamDetailsService.deleteTeamDetailsByTeamId(teamId);
        return ApiResponse.success(success);
    }
}
