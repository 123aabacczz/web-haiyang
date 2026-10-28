package com.example.demo.service;

import com.example.demo.mapper.ScheduleMapper;
import com.example.demo.model.Schedule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class ScheduleServiceImpl implements ScheduleService {

    @Autowired
    private ScheduleMapper scheduleMapper;

    @Override
    public List<Schedule> getSchedulesByUserAndDateRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return scheduleMapper.selectByUserIdAndDateRange(userId, start, end);
    }

    @Override
    public List<Schedule> getUpcomingSchedules(Long userId, int limit) {
        return scheduleMapper.selectUpcomingSchedules(userId, LocalDateTime.now(), limit);
    }

    @Override
    public Schedule getScheduleById(Long id) {
        return scheduleMapper.selectById(id);
    }

    @Override
    @Transactional
    public Schedule createSchedule(Schedule schedule) {
        // 验证必需字段
        if (schedule.getTitle() == null || schedule.getStartTime() == null) {
            throw new IllegalArgumentException("日程标题和开始时间是必需的");
        }

        // 设置创建和更新时间
        LocalDateTime now = LocalDateTime.now();
        schedule.setCreatedAt(now);
        schedule.setUpdatedAt(now);

        // 设置默认值
        if (schedule.getAllDay() == null) {
            schedule.setAllDay(false);
        }

        scheduleMapper.insert(schedule);

        // 添加日志记录
        log.info("已插入日程到数据库 - ID: {}", schedule.getId());

        return schedule;
    }
    @Override
    public Schedule updateSchedule(Long id, Schedule scheduleDetails) {
        Schedule schedule = scheduleMapper.selectById(id);
        if (schedule != null) {
            schedule.setTitle(scheduleDetails.getTitle());
            schedule.setStartTime(scheduleDetails.getStartTime());
            schedule.setEndTime(scheduleDetails.getEndTime());
            schedule.setAllDay(scheduleDetails.getAllDay());
            schedule.setType(scheduleDetails.getType());
            schedule.setLocation(scheduleDetails.getLocation());
            schedule.setDescription(scheduleDetails.getDescription());
            schedule.setUpdatedAt(LocalDateTime.now());

            scheduleMapper.update(schedule);
            return schedule;
        }
        return null;
    }

    @Override
    public void deleteSchedule(Long id) {
        scheduleMapper.deleteById(id);
    }

    @Override
    public boolean isScheduleOwnedByUser(Long scheduleId, Long userId) {
        return scheduleMapper.existsByIdAndUserId(scheduleId, userId);
    }

    @Override
    public List<Schedule> getSchedulesByDateRange(LocalDateTime start, LocalDateTime end) {
        return scheduleMapper.selectByDateRange(start, end);
    }

    @Override
    public List<Schedule> getUpcomingSchedules(int limit) {
        return scheduleMapper.selectUpcomingSchedules(LocalDateTime.now(), limit);
    }
}