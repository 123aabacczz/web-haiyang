package com.example.demo.service;

import com.example.demo.mapper.UserTaskCenterMapper;
import com.example.demo.model.UserTaskCenter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserTaskCenterServiceImpl implements UserTaskCenterService {
    
    @Autowired
    private UserTaskCenterMapper userTaskCenterMapper;

    @Override
    public UserTaskCenter getUserTaskCenterByUserId(Long userId) {
        UserTaskCenter userTaskCenter = userTaskCenterMapper.findByUserId(userId);
        if (userTaskCenter == null) {
            return createUserTaskCenter(userId);
        }
        return userTaskCenter;
    }

    @Override
    public UserTaskCenter createUserTaskCenter(Long userId) {
        UserTaskCenter userTaskCenter = new UserTaskCenter();
        userTaskCenter.setUserId(userId);
        userTaskCenter.setPoints(0);
        userTaskCenter.setAcceptedTasks(0);
        userTaskCenter.setCompletedTasks(0);
        userTaskCenter.setTodayPoints(0);
        userTaskCenter.setLevel(1);
        userTaskCenter.setExperience(0);
        userTaskCenter.setNextLevelExperience(1000);
        
        userTaskCenterMapper.insert(userTaskCenter);
        return userTaskCenter;
    }

    @Override
    public void updateUserTaskCenter(UserTaskCenter userTaskCenter) {
        userTaskCenterMapper.update(userTaskCenter);
    }

    @Override
    public void updatePoints(Long userId, Integer points) {
        userTaskCenterMapper.updatePoints(userId, points);
    }

    @Override
    public void updateTodayPoints(Long userId, Integer todayPoints) {
        userTaskCenterMapper.updateTodayPoints(userId, todayPoints);
    }

    @Override
    public void updateTaskStats(Long userId, Integer acceptedTasks, Integer completedTasks) {
        userTaskCenterMapper.updateTaskStats(userId, acceptedTasks, completedTasks);
    }

    @Override
    public void updateLevelStats(Long userId, Integer level, Integer experience, Integer nextLevelExperience) {
        userTaskCenterMapper.updateLevelStats(userId, level, experience, nextLevelExperience);
    }
}
