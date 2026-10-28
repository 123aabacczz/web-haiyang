package com.example.demo.service;

import com.example.demo.model.UserPoints;
import java.util.List;

public interface UserPointsService {
    List<UserPoints> getAllUserPoints();
    UserPoints getUserPointsByUserId(Integer userId);
    void createUserPoints(UserPoints userPoints);
    void updateUserPoints(UserPoints userPoints);
    void updatePoints(Integer userId, Integer points);
    void updateTodayPoints(Integer userId, Integer todayPoints);
    void updateTotalPoints(Integer userId, Long totalPoints);
    void updateRanking(Integer userId, Integer ranking);
}
