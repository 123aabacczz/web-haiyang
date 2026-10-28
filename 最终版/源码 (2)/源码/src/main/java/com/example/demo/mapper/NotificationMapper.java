// NotificationMapper.java
package com.example.demo.mapper;

import com.example.demo.model.Notification;
import org.apache.ibatis.annotations.*;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface NotificationMapper {

    @Insert("INSERT INTO notifications(message, type, is_read, created_at) " +
            "VALUES(#{message}, #{type}, false, NOW())")
    void insertNotification(@Param("message") String message, @Param("type") String type);

    @Insert("INSERT INTO notifications(message, type, is_read, created_at) " +
            "VALUES(#{message}, #{type}, #{read}, #{createdAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Notification notification);

    @Insert("INSERT INTO notifications(message, type, is_read, created_at) " +
            "VALUES(#{message}, #{type}, false, NOW())")
    void insertByType(@Param("message") String message, @Param("type") String type);

    @Select("SELECT COUNT(*) FROM notifications WHERE is_read = false")
    int getUnreadCount();

    @Select("SELECT id, message, type, is_read AS `read`, created_at AS createdAt " +
            "FROM notifications " +
            "WHERE is_read = FALSE AND DATE(created_at) = CURDATE() " +
            "ORDER BY created_at DESC")
    List<Notification> findTodayUnread();

    @Update("UPDATE notifications SET is_read = true WHERE id = #{id}")
    void markAsRead(Long id);

    @Update("UPDATE notifications SET is_read = true WHERE is_read = false AND DATE(created_at) = CURDATE()")
    void markTodayAsRead();

    @Delete("DELETE FROM notifications WHERE DATE(created_at) < CURDATE()")
    void deleteOldNotifications();

    List<Notification> findUnreadByType(@Param("type") String type);

    @Select("SELECT * FROM notifications WHERE message LIKE CONCAT('%', #{message}, '%') AND created_at = #{createdAt}")
    List<Notification> findByMessageAndTime(@Param("message") String message, @Param("createdAt") LocalDateTime createdAt);

    @Delete("DELETE FROM notifications WHERE id = #{id}")
    void delete(Long id);
}