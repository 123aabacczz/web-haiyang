package com.example.demo.service;

import com.example.demo.model.TeamPoints;
import java.util.List;

public interface TeamPointsService {
    List<TeamPoints> getAllTeamPoints();
    TeamPoints getTeamPointsByTeamId(Long teamId);
    void createTeamPoints(TeamPoints teamPoints);
    void updateTeamPoints(TeamPoints teamPoints);
    void updatePoints(Long teamId, Integer points);
    void updateTodayPoints(Long teamId, Integer todayPoints);
    void updateTotalPoints(Long teamId, Long totalPoints);
    void updateRanking(Long teamId, Integer ranking);
}
