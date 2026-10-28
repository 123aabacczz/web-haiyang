package com.example.demo.controller;

import com.example.demo.model.UserPoints;
import com.example.demo.service.UserPointsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-points")
public class UserPointsController {
    
    @Autowired
    private UserPointsService userPointsService;

    @GetMapping("/all")
    public List<UserPoints> getAllUserPoints() {
        return userPointsService.getAllUserPoints();
    }

    @GetMapping("/{userId}")
    public UserPoints getUserPointsByUserId(@PathVariable Integer userId) {
        return userPointsService.getUserPointsByUserId(userId);
    }

    @PostMapping
    public void createUserPoints(@RequestBody UserPoints userPoints) {
        userPointsService.createUserPoints(userPoints);
    }

    @PutMapping
    public void updateUserPoints(@RequestBody UserPoints userPoints) {
        userPointsService.updateUserPoints(userPoints);
    }

    @PutMapping("/{userId}/points")
    public void updatePoints(@PathVariable Integer userId, @RequestParam Integer points) {
        userPointsService.updatePoints(userId, points);
    }

    @PutMapping("/{userId}/today-points")
    public void updateTodayPoints(@PathVariable Integer userId, @RequestParam Integer todayPoints) {
        userPointsService.updateTodayPoints(userId, todayPoints);
    }

    @PutMapping("/{userId}/total-points")
    public void updateTotalPoints(@PathVariable Integer userId, @RequestParam Long totalPoints) {
        userPointsService.updateTotalPoints(userId, totalPoints);
    }

    @PutMapping("/{userId}/ranking")
    public void updateRanking(@PathVariable Integer userId, @RequestParam Integer ranking) {
        userPointsService.updateRanking(userId, ranking);
    }
}
