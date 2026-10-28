package com.example.demo.service;

import com.example.demo.mapper.TeamActivitiesMapper;
import com.example.demo.model.TeamActivities;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamActivitiesServiceImpl implements TeamActivitiesService {
    private final TeamActivitiesMapper teamActivitiesMapper;

    @Override
    public List<TeamActivities> getTeamActivitiesByTeamId(Long teamId) {
        return teamActivitiesMapper.selectByTeamId(teamId);
    }

    @Override
    public TeamActivities getTeamActivityById(Long id) {
        return teamActivitiesMapper.selectById(id);
    }

    @Override
    public Long createTeamActivity(TeamActivities teamActivities) {
        teamActivitiesMapper.insert(teamActivities);
        return teamActivities.getId();
    }

    @Override
    public boolean deleteTeamActivity(Long id) {
        return teamActivitiesMapper.delete(id);
    }

    @Override
    public boolean deleteTeamActivitiesByTeamId(Long teamId) {
        return teamActivitiesMapper.deleteByTeamId(teamId);
    }
}
