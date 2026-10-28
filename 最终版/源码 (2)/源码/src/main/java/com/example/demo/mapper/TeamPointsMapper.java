package com.example.demo.mapper;

import com.example.demo.model.TeamPoints;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface TeamPointsMapper {
    List<TeamPoints> findAll();
    TeamPoints findByTeamId(Long teamId);
    void insert(TeamPoints teamPoints);
    void update(TeamPoints teamPoints);
    void updatePoints(Long teamId, Integer points);
    void updateTodayPoints(Long teamId, Integer todayPoints);
    void updateTotalPoints(Long teamId, Long totalPoints);
    void updateRanking(Long teamId, Integer ranking);
}
