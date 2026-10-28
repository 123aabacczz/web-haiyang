package com.example.demo.service;

import com.example.demo.model.TeamDetails;

public interface TeamDetailsService {
    TeamDetails getTeamDetailsByTeamId(Long teamId);
    TeamDetails getTeamDetailsById(Long id);
    Long createTeamDetails(TeamDetails teamDetails);
    boolean updateTeamDetails(TeamDetails teamDetails);
    boolean deleteTeamDetailsByTeamId(Long teamId);
}
