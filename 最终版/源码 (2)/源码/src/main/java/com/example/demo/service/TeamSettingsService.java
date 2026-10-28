package com.example.demo.service;

import com.example.demo.model.TeamSettings;

public interface TeamSettingsService {
    TeamSettings getTeamSettingsByTeamId(Long teamId);
    TeamSettings getTeamSettingsById(Long id);
    Long createTeamSettings(TeamSettings teamSettings);
    boolean updateTeamSettings(TeamSettings teamSettings);
    boolean deleteTeamSettingsByTeamId(Long teamId);
}
