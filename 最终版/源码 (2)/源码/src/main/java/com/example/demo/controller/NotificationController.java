package com.example.demo.controller;

import com.example.demo.mapper.NotificationMapper;
import com.example.demo.model.Notification;
import com.example.demo.websocket.NotificationWebSocketHandler; // 修改导入路径
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationMapper notificationMapper;

    public NotificationController(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    // 获取当天未读通知
    @GetMapping("/today")
    public ResponseEntity<List<Notification>> getTodayUnread() {
        return ResponseEntity.ok(notificationMapper.findTodayUnread());
    }

    // 标记单条通知为已读
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationMapper.markAsRead(id);
        int unreadCount = notificationMapper.getUnreadCount();
        NotificationWebSocketHandler.broadcastUnreadCount(unreadCount);
        return ResponseEntity.ok().build();
    }

    // 标记当天所有通知为已读
    @PostMapping("/today/read-all")
    public ResponseEntity<Void> markTodayAsRead() {
        notificationMapper.markTodayAsRead();
        int unreadCount = notificationMapper.getUnreadCount();
        NotificationWebSocketHandler.broadcastUnreadCount(unreadCount);
        return ResponseEntity.ok().build();
    }

    // 添加新的通知
    @PostMapping("/{type}")
    public ResponseEntity<Void> createTypedNotification(
            @PathVariable String type,
            @RequestBody Map<String, String> request) {
        notificationMapper.insertByType(request.get("message"), type);

        // 广播新通知事件和未读数更新
        int unreadCount = notificationMapper.getUnreadCount();
        NotificationWebSocketHandler.broadcastNewNotification();
        NotificationWebSocketHandler.broadcastUnreadCount(unreadCount);

        return ResponseEntity.ok().build();
    }

    // 添加获取未读数接口
    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount() {
        return ResponseEntity.ok(notificationMapper.getUnreadCount());
    }
}