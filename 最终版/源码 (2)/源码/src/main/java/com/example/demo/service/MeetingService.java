// MeetingService.java
package com.example.demo.service;

import com.example.demo.mapper.MeetingMapper;
import com.example.demo.model.Meeting;
import com.example.demo.util.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {
    private final MeetingMapper meetingMapper;

    public void createMeeting(Meeting meeting) {
        meetingMapper.insert(meeting);
    }

    public void reviewMeeting(Long id, Integer status, String comment) {
        meetingMapper.updateStatus(id, status, comment);
    }

    public List<Meeting> getMeetingsByStatus(Integer status) {
        return meetingMapper.selectByStatus(status);
    }

    public Meeting getMeetingById(Long id) {
        return meetingMapper.selectById(id);
    }

    public PageInfo<Meeting> getAllMeetings(int page, int size) {
        int offset = (page - 1) * size;
        List<Meeting> meetings = meetingMapper.selectAllWithPagination(size, offset);
        long total = meetingMapper.countAll();

        PageInfo<Meeting> pageInfo = new PageInfo<>();
        pageInfo.setPage(page);
        pageInfo.setPageSize(size);
        pageInfo.setTotal(total);
        pageInfo.setList(meetings);

        return pageInfo;
    }

    /* === 追加到 MeetingService.java 最下方 === */
    public void deleteMeeting(Long id) {
        meetingMapper.deleteById(id);
    }
    public long countAll() {
        return meetingMapper.countAll();
    }

    public int countByStatus(int status) {
        return meetingMapper.countByStatus(status);
    }

    // MeetingService.java - 添加获取最近会议的方法
    public List<Meeting> getRecentMeetings() {
        return meetingMapper.selectRecentMeetings();
    }
}