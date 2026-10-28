package com.example.demo.mapper;

import com.example.demo.model.UserPoints;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

@Mapper
public interface UserPointsMapper {
    List<UserPoints> findAll();
    UserPoints findByUserId(Integer userId);
    void insert(UserPoints userPoints);
    void update(UserPoints userPoints);
    void updatePoints(Integer userId, Integer points);
    void updateTodayPoints(Integer userId, Integer todayPoints);
    void updateTotalPoints(Integer userId, Long totalPoints);
    void updateRanking(Integer userId, Integer ranking);
}
