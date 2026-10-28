package com.example.demo.mapper;

import com.example.demo.model.Meeting;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface MeetingMapper {
    @Insert("INSERT INTO meeting(title, content, organizer, meeting_time, status) " +
            "VALUES(#{title}, #{content}, #{organizer}, #{meetingTime}, #{status})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(Meeting meeting);

    @Update("UPDATE meeting SET status=#{status}, review_comment=#{reviewComment} WHERE id=#{id}")
    void updateStatus(@Param("id") Long id, @Param("status") Integer status,
                      @Param("reviewComment") String reviewComment);

    @Select("SELECT id, title, content, organizer, meeting_time as meetingTime, status, review_comment as reviewComment FROM meeting ORDER BY meeting_time DESC")
    List<Meeting> selectAll();

    @Select("SELECT id, title, content, organizer, meeting_time as meetingTime, status, review_comment as reviewComment FROM meeting WHERE status=#{status} ORDER BY meeting_time DESC")
    List<Meeting> selectByStatus(Integer status);

    @Select("SELECT id, title, content, organizer, meeting_time as meetingTime, status, review_comment as reviewComment FROM meeting WHERE id=#{id}")
    Meeting selectById(Long id);

    @Select("SELECT id, title, content, organizer, meeting_time as meetingTime, status, review_comment as reviewComment FROM meeting ORDER BY meeting_time DESC LIMIT #{limit} OFFSET #{offset}")
    List<Meeting> selectAllWithPagination(@Param("limit") int limit, @Param("offset") long offset);

    @Select("SELECT COUNT(*) FROM meeting")
    long countAll();

    @Select("SELECT COUNT(*) FROM meeting WHERE status = #{status}")
    int countByStatus(@Param("status") int status);

    @Select("SELECT id, title, content, organizer, meeting_time as meetingTime, status, review_comment as reviewComment FROM meeting WHERE meeting_time >= NOW() " +
            "ORDER BY meeting_time ASC LIMIT 5")
    List<Meeting> selectRecentMeetings();

    @Delete("DELETE FROM meeting WHERE id = #{id}")
    void deleteById(Long id);
}