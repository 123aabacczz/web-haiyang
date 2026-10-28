package com.example.demo.task;

import com.example.demo.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationCleanupTask {
    private final NotificationMapper notificationMapper;

    // 每天凌晨1点清理旧通知
    @Scheduled(cron = "0 0 1 * * ?")
    public void cleanupOldNotifications() {
        notificationMapper.deleteOldNotifications();
    }
}