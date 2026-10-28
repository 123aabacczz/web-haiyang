package com.example.demo.service;

import com.example.demo.mapper.ActivityLogMapper;
import com.example.demo.mapper.NotificationMapper;
import com.example.demo.model.ActivityLog;
import com.example.demo.model.Notification;
import com.example.demo.util.PageInfo;
import com.example.demo.websocket.NotificationWebSocketHandler; // 新增导入
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityLogService {
    private final ActivityLogMapper activityLogMapper;
    private final NotificationMapper notificationMapper;

    @Lazy
    private final UserProvider userProvider;

    @Transactional
    public void logActivity(String actionType, String targetType,
                            Long targetId, String description, String notificationType) {

        // 添加重复操作检查
        if (activityLogMapper.existsSimilarLog(
                actionType, targetType, targetId, description) > 0) {
            return;
        }

        // 通过UserProvider获取用户ID
        Long userId = userProvider.getCurrentUserId();

        try {
            // 1. 记录操作审计日志
            ActivityLog activityLog = new ActivityLog();
            activityLog.setUserId(userId);
            activityLog.setActionType(actionType);
            activityLog.setTargetType(targetType);
            activityLog.setTargetId(targetId);
            activityLog.setDescription(description);
            activityLog.setActionTime(LocalDateTime.now());
            activityLogMapper.insert(activityLog);

            // 2. 创建通知并广播
            String notificationMessage = String.format("[%s] %s: %s", actionType, targetType, description);
            Notification notification = new Notification();
            notification.setMessage(notificationMessage);
            notification.setType(notificationType);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationMapper.insert(notification);

            // 3. 广播相关事件（在事务提交后执行）
            broadcastEventsAfterCommit();

        } catch (DuplicateKeyException e) {
            // 忽略重复键异常，记录警告即可
            log.warn("Duplicate activity log skipped: {}-{}-{}-{}",
                    actionType, targetType, targetId, description);
        }
    }

    // 事务提交后广播事件
    private void broadcastEventsAfterCommit() {
        // 使用事务同步确保在事务提交后执行广播
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronizationAdapter() {
                    @Override
                    public void afterCommit() {
                        try {
                            // 获取最新未读数
                            int unreadCount = notificationMapper.getUnreadCount();

                            // 广播活动日志事件
                            NotificationWebSocketHandler.broadcastNewActivityLog();

                            // 广播新通知事件
                            NotificationWebSocketHandler.broadcastNewNotification();

                            // 广播未读数更新
                            NotificationWebSocketHandler.broadcastUnreadCount(unreadCount);

                            log.debug("Broadcasted events after transaction commit");
                        } catch (Exception e) {
                            log.error("Failed to broadcast events after transaction commit", e);
                        }
                    }
                }
        );
    }

    // 方法重载，默认通知类型为"AUDIT"
    @Transactional
    public void logActivity(String actionType, String targetType,
                            Long targetId, String description) {
        logActivity(actionType, targetType, targetId, description, "AUDIT");
    }

    public List<ActivityLog> getRecentActivities(int limit) {
        return activityLogMapper.selectRecent(limit);
    }

    public PageInfo<ActivityLog> getActivityLogs(int page, int size) {
        int offset = (page - 1) * size;
        List<ActivityLog> logs = activityLogMapper.selectPage(offset, size);
        long total = activityLogMapper.count();

        PageInfo<ActivityLog> pageInfo = new PageInfo<>();
        pageInfo.setList(logs);
        pageInfo.setTotal(total);
        pageInfo.setPage(page);
        pageInfo.setPageSize(size);
        return pageInfo;
    }

    @Transactional
    public void deleteActivityLog(Long activityLogId) {
        // 1. 先查询活动日志获取相关信息
        ActivityLog activityLog = activityLogMapper.selectById(activityLogId);
        if (activityLog == null) {
            throw new RuntimeException("活动日志不存在");
        }

        // 2. 删除活动日志
        activityLogMapper.deleteById(activityLogId);

        // 3. 查找并删除相关的通知
        // 根据活动日志的描述和时间来匹配通知
        // 注意：这里假设通知消息包含活动日志的描述
        List<Notification> relatedNotifications = notificationMapper.findByMessageAndTime(
                "%" + activityLog.getDescription() + "%",
                activityLog.getActionTime()
        );

        for (Notification notification : relatedNotifications) {
            notificationMapper.delete(notification.getId());
        }

        // 记录删除操作
        log.info("删除活动日志ID: {}及相关通知", activityLogId);
    }
}