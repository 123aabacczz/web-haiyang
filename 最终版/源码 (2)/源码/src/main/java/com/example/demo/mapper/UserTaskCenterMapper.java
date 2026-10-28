package com.example.demo.mapper;

import com.example.demo.model.UserTaskCenter;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserTaskCenterMapper {
    UserTaskCenter findByUserId(@Param("userId") Long userId);
    void insert(UserTaskCenter userTaskCenter);
    void update(UserTaskCenter userTaskCenter);
    void updatePoints(@Param("userId") Long userId, @Param("points") Integer points);
    void updateTodayPoints(@Param("userId") Long userId, @Param("todayPoints") Integer todayPoints);
    void updateTaskStats(@Param("userId") Long userId, @Param("acceptedTasks") Integer acceptedTasks, @Param("completedTasks") Integer completedTasks);
    void updateLevelStats(@Param("userId") Long userId, @Param("level") Integer level, @Param("experience") Integer experience, @Param("nextLevelExperience") Integer nextLevelExperience);
}
