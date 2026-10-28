package com.example.demo.controller;

import com.example.demo.model.Announcement;
import com.example.demo.model.Meeting;
import com.example.demo.model.Task;
import com.example.demo.service.MeetingService;
import com.example.demo.service.TaskService;
import com.example.demo.util.PageInfo;
import com.example.demo.service.AnnouncementService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/home-info/announcements")
public class AnnouncementController {
    private final AnnouncementService announcementService;
    private final MeetingService meetingService;
    private final TaskService taskService;

    public AnnouncementController(AnnouncementService announcementService, MeetingService meetingService, TaskService taskService) {
        this.announcementService = announcementService;
        this.meetingService = meetingService;
        this.taskService = taskService;
    }

    // 获取重要公告 - 需要登录
    @GetMapping("/important")
    public ResponseEntity<List<Announcement>> getImportantAnnouncements(HttpSession session) {
        // 检查用户是否登录
        if (session.getAttribute("user") == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(announcementService.getImportantAnnouncements());
    }

    // 获取最新公告 - 需要登录
    @GetMapping("/latest")
    public ResponseEntity<List<Announcement>> getLatestAnnouncements(
            @RequestParam(value = "count", defaultValue = "5") int count,  // 明确指定参数名
            HttpSession session) {
        if (session.getAttribute("user") == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(announcementService.getLatestAnnouncements(count));
    }

    @GetMapping("/meetings/recent")
    public ResponseEntity<List<Meeting>> getRecentMeetings() {
        return ResponseEntity.ok(meetingService.getRecentMeetings());
    }

    @GetMapping("/tasks/recent")
    public ResponseEntity<List<Task>> getRecentTasks() {
        return ResponseEntity.ok(taskService.getRecentTasks());
    }

    // 创建公告
    @PostMapping
    public ResponseEntity<Announcement> createAnnouncement(@RequestBody Announcement announcement) {
        Announcement created = announcementService.createAnnouncement(announcement);
        return ResponseEntity.ok(created);
    }

    // 更新公告
    @PutMapping("/{id}")
    public ResponseEntity<Announcement> updateAnnouncement(
            @PathVariable Long id,
            @RequestBody Announcement announcement) {
        announcement.setId(id);
        Announcement updated = announcementService.updateAnnouncement(announcement);
        return ResponseEntity.ok(updated);
    }

    // 删除公告
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok().build();
    }

    // 获取所有公告（分页） - 需要登录
    @GetMapping
    public ResponseEntity<PageInfo<Announcement>> getAllAnnouncements(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session) {
        // 检查用户是否登录
        if (session.getAttribute("user") == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(announcementService.getAllAnnouncements(page, size));
    }

    // 获取公告详情 - 需要登录
    @GetMapping("/{id}")
    public ResponseEntity<Announcement> getAnnouncementById(
            @PathVariable(name = "id") Long id,
            HttpSession session) {
        // 检查用户是否登录
        if (session.getAttribute("user") == null) {
            return ResponseEntity.status(401).build();
        }

        Announcement announcement = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(announcement);
    }
}