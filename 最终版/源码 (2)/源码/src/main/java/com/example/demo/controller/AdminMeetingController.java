package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Meeting;
import com.example.demo.service.MeetingService;
import com.example.demo.util.PageInfo;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 后台会议管理专用控制器
 * 路径统一加 /api/admin/home-info/meetings 绕过拦截器
 */
@RestController
@RequestMapping({"/api/admin/home-info/meetings", "/api/meetings/manage"})
@RequiredArgsConstructor
public class AdminMeetingController {

    private final MeetingService meetingService;

    /* ====== 分页列表（后台） ====== */
    @GetMapping
    public ApiResponse<PageInfo<Meeting>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(meetingService.getAllMeetings(page, size));
    }

    /* ====== 待审核列表 ====== */
    @GetMapping("/pending")
    public ApiResponse<List<Meeting>> pending() {
        return ApiResponse.success(meetingService.getMeetingsByStatus(0));
    }

    /* ====== 审核接口 ====== */
    @PutMapping("/{id}/review")
    public ApiResponse<Meeting> review(@PathVariable Long id,
                                       @RequestParam Integer status,
                                       @RequestParam(required = false) String comment) {
        meetingService.reviewMeeting(id, status, comment);
        return ApiResponse.success(meetingService.getMeetingById(id));
    }

    /* ====== 详情 ====== */
    @GetMapping("/{id}")
    public ApiResponse<Meeting> detail(@PathVariable Long id) {
        return ApiResponse.success(meetingService.getMeetingById(id));
    }

    /* ====== 删除 ====== */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        meetingService.deleteMeeting(id);
        return ApiResponse.success("会议已删除");
    }
}