package com.example.demo.service;

import com.example.demo.model.UserStatistics;

public interface UserStatisticsService {
    UserStatistics getByUserId(Long userId);
    UserStatistics createOrUpdate(UserStatistics userStatistics);
    void deleteByUserId(Long userId);
}