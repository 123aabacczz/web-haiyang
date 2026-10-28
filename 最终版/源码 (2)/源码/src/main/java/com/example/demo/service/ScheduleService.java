package com.example.demo.service;

import com.example.demo.model.Schedule;

import java.time.LocalDateTime;
import java.util.List;

public interface ScheduleService {
    List<Schedule> getSchedulesByUserAndDateRange(Long userId, LocalDateTime start, LocalDateTime end);
    List<Schedule> getUpcomingSchedules(Long userId, int limit);
    Schedule getScheduleById(Long id);
    Schedule createSchedule(Schedule schedule);
    Schedule updateSchedule(Long id, Schedule schedule);
    void deleteSchedule(Long id);
    boolean isScheduleOwnedByUser(Long scheduleId, Long userId);
    // ScheduleService.java 确保有以下方法
    List<Schedule> getSchedulesByDateRange(LocalDateTime start, LocalDateTime end);
    List<Schedule> getUpcomingSchedules(int limit);
}