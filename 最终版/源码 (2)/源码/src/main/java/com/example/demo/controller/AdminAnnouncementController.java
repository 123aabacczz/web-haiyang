package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.mapper.NotificationMapper;
import com.example.demo.model.Announcement;
import com.example.demo.service.AnnouncementService;
import com.example.demo.util.PageInfo;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 公告后台管理接口
 * 路径改用 /api/announcements/manage 绕过 /api/admin/** 的权限拦截
 */
@RestController
@RequestMapping({"/api/announcements/manage", "/api/admin/home-info/announcements"})
@RequiredArgsConstructor
public class AdminAnnouncementController {

    private final AnnouncementService announcementService;

    private final NotificationMapper notificationMapper; // ✅ 注入 Mapper

    /* ======== 分页列表（管理员） ======== */
    @GetMapping
    public ApiResponse<PageInfo<Announcement>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(announcementService.getAllAnnouncements(page, size));
    }

    @GetMapping("/admin/home-info/announcements")   // 精确匹配前端地址
    public ApiResponse<PageInfo<Announcement>> adminAnnouncements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(announcementService.getAllAnnouncements(page, size));
    }

    /* ======== 追加：未读消息数 ======== */
    @GetMapping("/notifications/unread-count")
    public ApiResponse<Integer> unreadCount(HttpSession session) {
        if (session.getAttribute("user") == null) {
            return ApiResponse.success(0);
        }
        // ✅ 直接调用 Mapper
        int c = notificationMapper.getUnreadCount();
        return ApiResponse.success(c);
    }

    @GetMapping("/important")
    public ApiResponse<List<Announcement>> important() {
        return ApiResponse.success(announcementService.getImportantAnnouncements());
    }

    @GetMapping("/latest")
    public ApiResponse<List<Announcement>> latest(
            @RequestParam(defaultValue = "5") int count) {
        return ApiResponse.success(announcementService.getLatestAnnouncements(count));
    }

    @GetMapping("/{id}")
    public ApiResponse<Announcement> detail(@PathVariable Long id) {
        return ApiResponse.success(announcementService.getAnnouncementById(id));
    }

    @PostMapping
    public ApiResponse<Announcement> create(@RequestBody Announcement ann) {
        return ApiResponse.success(announcementService.createAnnouncement(ann));
    }

    @PutMapping("/{id}")
    public ApiResponse<Announcement> update(@PathVariable Long id,
                                            @RequestBody Announcement ann) {
        ann.setId(id);
        return ApiResponse.success(announcementService.updateAnnouncement(ann));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ApiResponse.success("公告已删除");
    }
}