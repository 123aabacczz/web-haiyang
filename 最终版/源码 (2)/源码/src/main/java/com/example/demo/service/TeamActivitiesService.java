package com.example.demo.service;

import com.example.demo.model.TeamActivities;

import java.util.List;

public interface TeamActivitiesService {
    List<TeamActivities> getTeamActivitiesByTeamId(Long teamId);
    TeamActivities getTeamActivityById(Long id);
    Long createTeamActivity(TeamActivities teamActivities);
    boolean deleteTeamActivity(Long id);
    boolean deleteTeamActivitiesByTeamId(Long teamId);
}
