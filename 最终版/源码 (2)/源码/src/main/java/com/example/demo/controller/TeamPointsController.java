package com.example.demo.controller;

import com.example.demo.model.TeamPoints;
import com.example.demo.service.TeamPointsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-points")
public class TeamPointsController {
    
    @Autowired
    private TeamPointsService teamPointsService;

    @GetMapping("/all")
    public List<TeamPoints> getAllTeamPoints() {
        return teamPointsService.getAllTeamPoints();
    }

    @GetMapping("/{teamId}")
    public TeamPoints getTeamPointsByTeamId(@PathVariable Long teamId) {
        return teamPointsService.getTeamPointsByTeamId(teamId);
    }

    @PostMapping
    public void createTeamPoints(@RequestBody TeamPoints teamPoints) {
        teamPointsService.createTeamPoints(teamPoints);
    }

    @PutMapping
    public void updateTeamPoints(@RequestBody TeamPoints teamPoints) {
        teamPointsService.updateTeamPoints(teamPoints);
    }

    @PutMapping("/{teamId}/points")
    public void updatePoints(@PathVariable Long teamId, @RequestParam Integer points) {
        teamPointsService.updatePoints(teamId, points);
    }

    @PutMapping("/{teamId}/today-points")
    public void updateTodayPoints(@PathVariable Long teamId, @RequestParam Integer todayPoints) {
        teamPointsService.updateTodayPoints(teamId, todayPoints);
    }

    @PutMapping("/{teamId}/total-points")
    public void updateTotalPoints(@PathVariable Long teamId, @RequestParam Long totalPoints) {
        teamPointsService.updateTotalPoints(teamId, totalPoints);
    }

    @PutMapping("/{teamId}/ranking")
    public void updateRanking(@PathVariable Long teamId, @RequestParam Integer ranking) {
        teamPointsService.updateRanking(teamId, ranking);
    }
}
