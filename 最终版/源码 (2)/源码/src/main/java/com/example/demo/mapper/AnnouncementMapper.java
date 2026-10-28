// AnnouncementMapper.java
package com.example.demo.mapper;

import com.example.demo.model.Announcement;
import com.example.demo.model.Report;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AnnouncementMapper {
    @Insert("INSERT INTO announcement(title, content, publisher, publish_time, status, important) " +  // 添加 important
            "VALUES(#{title}, #{content}, #{publisher}, NOW(), #{status}, #{important})")  // 添加 #{important}
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Announcement announcement);

    @Update("UPDATE announcement SET title=#{title}, content=#{content}, status=#{status}, important=#{important} WHERE id=#{id}")  // 添加 important=#{important}
    void update(Announcement announcement);

    @Delete("DELETE FROM announcement WHERE id=#{id}")
    void delete(Long id);

    @Select("SELECT id, title, content, publisher, status, " +
            "publish_time AS publishTime, important " +  // 保留 important
            "FROM announcement WHERE status != 0 ORDER BY publish_time DESC")
    List<Announcement> selectAll();

    @Select("SELECT id, title, content, publisher, status, " +
            "publish_time AS publishTime, important " +  // 添加 important
            "FROM announcement WHERE id = #{id}")
    Announcement selectById(Long id);

    @Select("SELECT COUNT(*) FROM announcement")
    int countAll();

    @Select("SELECT COUNT(*) FROM announcement WHERE status = #{status}")
    int countByStatus(@Param("status") int status);

    @Select("SELECT COUNT(*) FROM announcement WHERE status = 0")
    int countPending();

    @Select("SELECT id, title, content, publisher, status, " +
            "publish_time AS publishTime, important " +  // 添加 important
            "FROM announcement ORDER BY publish_time DESC LIMIT #{limit} OFFSET #{offset}")
    List<Announcement> selectWithPagination(@Param("limit") int limit, @Param("offset") int offset);

    @Select("SELECT id, title, content, publisher, status, " +
            "publish_time AS publishTime, important " +  // 添加 important
            "FROM announcement WHERE status = 1 ORDER BY publish_time DESC LIMIT 5")
    List<Announcement> selectImportantAnnouncements();

    @Select("SELECT id, title, content, publisher, status, " +
            "publish_time AS publishTime, important " +  // 添加 important
            "FROM announcement ORDER BY publish_time DESC LIMIT #{count}")
    List<Announcement> selectLatestAnnouncements(@Param("count") int count);

    @Insert("INSERT INTO user_announcement_status (user_id, announcement_id, is_read, last_viewed, created_at) " +
            "VALUES (#{userId}, #{announcementId}, 1, NOW(), NOW()) " +
            "ON DUPLICATE KEY UPDATE is_read = 1, last_viewed = NOW()")
    void markAsRead(@Param("userId") Long userId, @Param("announcementId") Long announcementId);

    @Select("SELECT COUNT(*) FROM user_announcement_status WHERE user_id = #{userId} AND announcement_id = #{announcementId} AND is_read = 1")
    int checkIfRead(@Param("userId") Long userId, @Param("announcementId") Long announcementId);
}