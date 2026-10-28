package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Meeting;
import com.example.demo.util.PageInfo;
import com.example.demo.service.MeetingService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/home-info")
public class MeetingController {
    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping("/meetings")
    public ResponseEntity<Meeting> createMeeting(@RequestBody Meeting meeting) {
        meetingService.createMeeting(meeting);
        return ResponseEntity.ok(meeting);
    }

    @PutMapping("/meetings/{id}/review")
    public ResponseEntity<Meeting> reviewMeeting(
            @PathVariable(name = "id") Long id,
            @RequestParam(name = "status") Integer status,
            @RequestParam(name = "comment", required = false) String comment
    ){
        meetingService.reviewMeeting(id, status, comment);
        return ResponseEntity.ok(meetingService.getMeetingById(id));
    }

    // MeetingController.java - 添加用户会话验证
    @GetMapping("/meetings")
    public ResponseEntity<ApiResponse<PageInfo<Meeting>>> getAllMeetings(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            HttpSession session) {

        // 检查用户会话
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录用户账户", 401));
        }

        try {
            PageInfo<Meeting> pageInfo = meetingService.getAllMeetings(page, size);
            return ResponseEntity.ok(ApiResponse.success(pageInfo));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取会议数据失败"));
        }
    }

    @GetMapping("/meetings/pending")
    public ResponseEntity<List<Meeting>> getPendingMeetings() {
        try {
            List<Meeting> meetings = meetingService.getMeetingsByStatus(0);
            return ResponseEntity.ok(meetings);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
        }
    }

    // MeetingController.java - 添加获取最近会议的端点
    @GetMapping("/meetings/recent")
    public ResponseEntity<ApiResponse<List<Meeting>>> getRecentMeetings(HttpSession session) {
        // 检查用户会话
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录用户账户", 401));
        }

        try {
            List<Meeting> recentMeetings = meetingService.getRecentMeetings();
            return ResponseEntity.ok(ApiResponse.success(recentMeetings));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取最近会议失败"));
        }
    }

    @GetMapping("/meetings/{id}")
    public ResponseEntity<ApiResponse<Meeting>> getMeetingDetail(
            @PathVariable(name = "id") Long id,
            HttpSession session) {

        // 检查用户会话
        Object userObj = session.getAttribute("user");
        if (userObj == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录用户账户", 401));
        }

        try {
            Meeting meeting = meetingService.getMeetingById(id);
            if (meeting == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("会议不存在"));
            }
            return ResponseEntity.ok(ApiResponse.success(meeting));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("获取会议详情失败"));
        }
    }
}