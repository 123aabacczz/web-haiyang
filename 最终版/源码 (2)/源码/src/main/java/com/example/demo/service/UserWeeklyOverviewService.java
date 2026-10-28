package com.example.demo.service;

import com.example.demo.model.UserWeeklyOverview;
import java.time.LocalDate;

public interface UserWeeklyOverviewService {
    UserWeeklyOverview getByUserIdAndWeekStart(Long userId, LocalDate weekStartDate);
    UserWeeklyOverview getLatestByUserId(Long userId);
    UserWeeklyOverview createOrUpdate(UserWeeklyOverview overview);
}