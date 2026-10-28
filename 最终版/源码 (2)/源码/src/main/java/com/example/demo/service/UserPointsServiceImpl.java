package com.example.demo.service;

import com.example.demo.mapper.UserPointsMapper;
import com.example.demo.model.UserPoints;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserPointsServiceImpl implements UserPointsService {
    
    @Autowired
    private UserPointsMapper userPointsMapper;

    @Override
    public List<UserPoints> getAllUserPoints() {
        return userPointsMapper.findAll();
    }

    @Override
    public UserPoints getUserPointsByUserId(Integer userId) {
        return userPointsMapper.findByUserId(userId);
    }

    @Override
    public void createUserPoints(UserPoints userPoints) {
        userPointsMapper.insert(userPoints);
    }

    @Override
    public void updateUserPoints(UserPoints userPoints) {
        userPointsMapper.update(userPoints);
    }

    @Override
    public void updatePoints(Integer userId, Integer points) {
        userPointsMapper.updatePoints(userId, points);
    }

    @Override
    public void updateTodayPoints(Integer userId, Integer todayPoints) {
        userPointsMapper.updateTodayPoints(userId, todayPoints);
    }

    @Override
    public void updateTotalPoints(Integer userId, Long totalPoints) {
        userPointsMapper.updateTotalPoints(userId, totalPoints);
    }

    @Override
    public void updateRanking(Integer userId, Integer ranking) {
        userPointsMapper.updateRanking(userId, ranking);
    }
}
