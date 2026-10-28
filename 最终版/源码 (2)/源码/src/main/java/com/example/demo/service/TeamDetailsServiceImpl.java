package com.example.demo.service;

import com.example.demo.mapper.TeamDetailsMapper;
import com.example.demo.model.TeamDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TeamDetailsServiceImpl implements TeamDetailsService {
    private final TeamDetailsMapper teamDetailsMapper;

    @Override
    public TeamDetails getTeamDetailsByTeamId(Long teamId) {
        return teamDetailsMapper.selectByTeamId(teamId);
    }

    @Override
    public TeamDetails getTeamDetailsById(Long id) {
        return teamDetailsMapper.selectById(id);
    }

    @Override
    public Long createTeamDetails(TeamDetails teamDetails) {
        teamDetailsMapper.insert(teamDetails);
        return teamDetails.getId();
    }

    @Override
    public boolean updateTeamDetails(TeamDetails teamDetails) {
        return teamDetailsMapper.update(teamDetails);
    }

    @Override
    public boolean deleteTeamDetailsByTeamId(Long teamId) {
        return teamDetailsMapper.deleteByTeamId(teamId);
    }
}
