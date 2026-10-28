package com.example.demo.service;

import com.example.demo.model.UserTaskCenter;

public interface UserTaskCenterService {
    UserTaskCenter getUserTaskCenterByUserId(Long userId);
    UserTaskCenter createUserTaskCenter(Long userId);
    void updateUserTaskCenter(UserTaskCenter userTaskCenter);
    void updatePoints(Long userId, Integer points);
    void updateTodayPoints(Long userId, Integer todayPoints);
    void updateTaskStats(Long userId, Integer acceptedTasks, Integer completedTasks);
    void updateLevelStats(Long userId, Integer level, Integer experience, Integer nextLevelExperience);
}
