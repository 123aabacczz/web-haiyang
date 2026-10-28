package com.example.demo.service;

import com.example.demo.mapper.TeamSettingsMapper;
import com.example.demo.model.TeamSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeamSettingsServiceImpl implements TeamSettingsService {
    private final TeamSettingsMapper teamSettingsMapper;

    @Override
    public TeamSettings getTeamSettingsByTeamId(Long teamId) {
        return teamSettingsMapper.selectByTeamId(teamId);
    }

    @Override
    public TeamSettings getTeamSettingsById(Long id) {
        return teamSettingsMapper.selectById(id);
    }

    @Override
    public Long createTeamSettings(TeamSettings teamSettings) {
        teamSettingsMapper.insert(teamSettings);
        return teamSettings.getId();
    }

    @Override
    public boolean updateTeamSettings(TeamSettings teamSettings) {
        // 先更新团队设置
        boolean settingsUpdated = teamSettingsMapper.updateTeamSettings(teamSettings);
        // 再更新团队信息
        boolean infoUpdated = teamSettingsMapper.updateTeamInfo(teamSettings);
        // 只有两个更新都成功才算成功
        return settingsUpdated && infoUpdated;
    }

    @Override
    public boolean deleteTeamSettingsByTeamId(Long teamId) {
        return teamSettingsMapper.deleteByTeamId(teamId);
    }
}
