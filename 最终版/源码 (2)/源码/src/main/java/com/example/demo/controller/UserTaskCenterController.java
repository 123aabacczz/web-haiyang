package com.example.demo.controller;

import com.example.demo.model.UserTaskCenter;
import com.example.demo.service.UserTaskCenterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-task-center")
public class UserTaskCenterController {
    
    @Autowired
    private UserTaskCenterService userTaskCenterService;

    @GetMapping("/{userId}")
    public UserTaskCenter getUserTaskCenter(@PathVariable Long userId) {
        return userTaskCenterService.getUserTaskCenterByUserId(userId);
    }

    @PutMapping("/{userId}/points")
    public void updatePoints(@PathVariable Long userId, @RequestParam Integer points) {
        userTaskCenterService.updatePoints(userId, points);
    }

    @PutMapping("/{userId}/today-points")
    public void updateTodayPoints(@PathVariable Long userId, @RequestParam Integer todayPoints) {
        userTaskCenterService.updateTodayPoints(userId, todayPoints);
    }

    @PutMapping("/{userId}/task-stats")
    public void updateTaskStats(@PathVariable Long userId, 
                               @RequestParam Integer acceptedTasks, 
                               @RequestParam Integer completedTasks) {
        userTaskCenterService.updateTaskStats(userId, acceptedTasks, completedTasks);
    }

    @PutMapping("/{userId}/level-stats")
    public void updateLevelStats(@PathVariable Long userId, 
                                @RequestParam Integer level, 
                                @RequestParam Integer experience, 
                                @RequestParam Integer nextLevelExperience) {
        userTaskCenterService.updateLevelStats(userId, level, experience, nextLevelExperience);
    }
}
