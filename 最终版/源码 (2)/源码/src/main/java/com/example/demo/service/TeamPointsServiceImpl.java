package com.example.demo.service;

import com.example.demo.mapper.TeamPointsMapper;
import com.example.demo.model.TeamPoints;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamPointsServiceImpl implements TeamPointsService {
    
    @Autowired
    private TeamPointsMapper teamPointsMapper;

    @Override
    public List<TeamPoints> getAllTeamPoints() {
        return teamPointsMapper.findAll();
    }

    @Override
    public TeamPoints getTeamPointsByTeamId(Long teamId) {
        return teamPointsMapper.findByTeamId(teamId);
    }

    @Override
    public void createTeamPoints(TeamPoints teamPoints) {
        teamPointsMapper.insert(teamPoints);
    }

    @Override
    public void updateTeamPoints(TeamPoints teamPoints) {
        teamPointsMapper.update(teamPoints);
    }

    @Override
    public void updatePoints(Long teamId, Integer points) {
        teamPointsMapper.updatePoints(teamId, points);
    }

    @Override
    public void updateTodayPoints(Long teamId, Integer todayPoints) {
        teamPointsMapper.updateTodayPoints(teamId, todayPoints);
    }

    @Override
    public void updateTotalPoints(Long teamId, Long totalPoints) {
        teamPointsMapper.updateTotalPoints(teamId, totalPoints);
    }

    @Override
    public void updateRanking(Long teamId, Integer ranking) {
        teamPointsMapper.updateRanking(teamId, ranking);
    }
}
