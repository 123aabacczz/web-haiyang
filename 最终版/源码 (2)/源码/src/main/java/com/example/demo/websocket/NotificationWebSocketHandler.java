package com.example.demo.websocket;

import com.example.demo.mapper.NotificationMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    // 保存所有已连接的会话
    private static final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final NotificationMapper notificationMapper;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 通过构造函数注入NotificationMapper
    public NotificationWebSocketHandler(NotificationMapper notificationMapper) {
        this.notificationMapper = notificationMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.put(session.getId(), session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        // 客户端发送 "subscribe" 时返回当前未读数
        if ("subscribe".equals(payload)) {
            int count = notificationMapper.getUnreadCount();
            session.sendMessage(new TextMessage(
                    "{\"type\":\"badge-update\",\"count\":" + count + "}"));
        }
    }

    /**
     * 广播消息给所有已连接的客户端
     */
    public static void broadcast(String json) {
        sessions.values().forEach(session -> {
            if (session.isOpen()) {
                try {
                    session.sendMessage(new TextMessage(json));
                } catch (IOException e) {
                    // 记录日志或处理异常
                }
            }
        });
    }

    /**
     * 广播未读数更新给所有客户端
     */
    public static void broadcastUnreadCount(int count) {
        String json = String.format("{\"type\":\"badge-update\",\"count\":%d}", count);
        broadcast(json);
    }

    /**
     * 广播新活动日志事件
     */
    public static void broadcastNewActivityLog() {
        broadcast("{\"type\":\"new-activity-log\"}");
    }

    /**
     * 广播新通知事件
     */
    public static void broadcastNewNotification() {
        broadcast("{\"type\":\"new-notification\"}");
    }
}