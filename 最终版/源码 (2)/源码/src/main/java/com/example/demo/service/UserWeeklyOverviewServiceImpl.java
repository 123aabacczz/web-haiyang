package com.example.demo.service;

import com.example.demo.mapper.UserWeeklyOverviewMapper;
import com.example.demo.model.UserWeeklyOverview;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Service
public class UserWeeklyOverviewServiceImpl implements UserWeeklyOverviewService {

    private final UserWeeklyOverviewMapper userWeeklyOverviewMapper;

    public UserWeeklyOverviewServiceImpl(UserWeeklyOverviewMapper userWeeklyOverviewMapper) {
        this.userWeeklyOverviewMapper = userWeeklyOverviewMapper;
    }

    @Override
    public UserWeeklyOverview getByUserIdAndWeekStart(Long userId, LocalDate weekStartDate) {
        return userWeeklyOverviewMapper.selectByUserIdAndWeekStart(userId, weekStartDate);
    }

    @Override
    public UserWeeklyOverview getLatestByUserId(Long userId) {
        return userWeeklyOverviewMapper.selectLatestByUserId(userId);
    }

    @Override
    @Transactional
    public UserWeeklyOverview createOrUpdate(UserWeeklyOverview overview) {
        overview.setCreatedAt(LocalDateTime.now());

        UserWeeklyOverview existing = userWeeklyOverviewMapper.selectByUserIdAndWeekStart(
                overview.getUserId(), overview.getWeekStartDate());

        if (existing != null) {
            userWeeklyOverviewMapper.updateByUserIdAndWeekStart(overview);
            return overview;
        } else {
            userWeeklyOverviewMapper.insert(overview);
            return overview;
        }
    }
}