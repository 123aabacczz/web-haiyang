package com.example.demo.service;

import com.example.demo.mapper.UserStatisticsMapper;
import com.example.demo.model.UserStatistics;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserStatisticsServiceImpl implements UserStatisticsService {

    private final UserStatisticsMapper userStatisticsMapper;

    public UserStatisticsServiceImpl(UserStatisticsMapper userStatisticsMapper) {
        this.userStatisticsMapper = userStatisticsMapper;
    }

    @Override
    public UserStatistics getByUserId(Long userId) {
        return userStatisticsMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public UserStatistics createOrUpdate(UserStatistics userStatistics) {
        LocalDateTime now = LocalDateTime.now();
        userStatistics.setCreatedAt(now);
        userStatistics.setUpdatedAt(now);

        UserStatistics existing = userStatisticsMapper.selectByUserId(userStatistics.getUserId());
        if (existing != null) {
            userStatisticsMapper.updateByUserId(userStatistics);
            return userStatistics;
        } else {
            userStatisticsMapper.insert(userStatistics);
            return userStatistics;
        }
    }

    @Override
    @Transactional
    public void deleteByUserId(Long userId) {
        userStatisticsMapper.deleteByUserId(userId);
    }
}