package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.User;
import com.example.demo.model.UserProfile;
import com.example.demo.model.UserTag;
import com.example.demo.model.UserTaskCenter;
import com.example.demo.model.UserStatistics;
import com.example.demo.model.UserWeeklyOverview;
import com.example.demo.service.UserProfileService;
import com.example.demo.service.UserService;
import com.example.demo.service.UserTagService;
import com.example.demo.service.UserTaskCenterService;
import com.example.demo.service.UserStatisticsService;
import com.example.demo.service.UserWeeklyOverviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/personal-center")
public class PersonalCenterController {

    private final UserProfileService userProfileService;
    private final UserTagService userTagService;
    private final UserStatisticsService userStatisticsService;
    private final UserWeeklyOverviewService userWeeklyOverviewService;
    private final UserService userService;
    private final UserTaskCenterService userTaskCenterService;

    public PersonalCenterController(UserProfileService userProfileService, UserTagService userTagService,
                                  UserStatisticsService userStatisticsService, UserWeeklyOverviewService userWeeklyOverviewService,
                                  UserService userService, UserTaskCenterService userTaskCenterService) {
        this.userProfileService = userProfileService;
        this.userTagService = userTagService;
        this.userStatisticsService = userStatisticsService;
        this.userWeeklyOverviewService = userWeeklyOverviewService;
        this.userService = userService;
        this.userTaskCenterService = userTaskCenterService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProfile(HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
        }

        Map<String, Object> profileData = new HashMap<>();

        // 账号信息以 users 表为准，等级以 user_levels 表为准
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("用户不存在"));
        }
        Integer userLevel = userService.getUserLevel(userId);

        // 获取用户基本信息
        UserProfile profile = userProfileService.getByUserId(userId);
        if (profile == null) {
            // 创建默认个人信息（姓名、职位、等级与登录账号保持一致）
            profile = new UserProfile();
            profile.setUserId(userId);
            profile.setUsername(user.getUsername());
            profile.setTitle(user.getPosition() != null ? user.getPosition() : "暂无职位");
            profile.setLevel(userLevel);
            profile.setBio("暂无简介");
            profile.setCreatedAt(LocalDateTime.now());
            profile.setUpdatedAt(LocalDateTime.now());
            profile = userProfileService.createOrUpdate(profile);
        } else {
            // 同步历史占位数据：用户N、等级1 等与真实登录信息不一致的情况
            boolean changed = false;
            if (user.getUsername() != null && !user.getUsername().equals(profile.getUsername())) {
                profile.setUsername(user.getUsername());
                changed = true;
            }
            if (userLevel != null && !userLevel.equals(profile.getLevel())) {
                profile.setLevel(userLevel);
                changed = true;
            }
            boolean titleMissing = profile.getTitle() == null || profile.getTitle().trim().isEmpty()
                    || "暂无职位".equals(profile.getTitle());
            if (titleMissing && user.getPosition() != null && !user.getPosition().trim().isEmpty()) {
                profile.setTitle(user.getPosition());
                changed = true;
            }
            if (changed) {
                profile.setUpdatedAt(LocalDateTime.now());
                profile = userProfileService.createOrUpdate(profile);
            }
        }
        profileData.put("profile", profile);

        // 获取用户任务中心数据（经验值、升级所需经验）
        UserTaskCenter taskCenter = userTaskCenterService.getUserTaskCenterByUserId(userId);
        profileData.put("taskCenter", taskCenter);

        // 获取用户标签
        List<UserTag> tags = userTagService.getByUserId(userId);
        profileData.put("tags", tags);

        // 获取用户统计数据
        UserStatistics statistics = userStatisticsService.getByUserId(userId);
        if (statistics == null) {
            // 创建默认统计数据
            statistics = new UserStatistics();
            statistics.setUserId(userId);
            statistics.setProjectsCount(0);
            statistics.setDocumentsCount(0);
            statistics.setSkillsCount(0);
            statistics.setWorkYears(0);
            statistics.setCreatedAt(LocalDateTime.now());
            statistics.setUpdatedAt(LocalDateTime.now());
            statistics = userStatisticsService.createOrUpdate(statistics);
        }
        profileData.put("statistics", statistics);

        // 获取用户周概览数据
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        UserWeeklyOverview overview = userWeeklyOverviewService.getByUserIdAndWeekStart(userId, weekStart);
        if (overview == null) {
            // 创建默认周概览数据
            overview = new UserWeeklyOverview();
            overview.setUserId(userId);
            overview.setWeekStartDate(weekStart);
            overview.setWeekEndDate(weekStart.plusDays(6));
            overview.setDocumentsCreated(0);
            overview.setTasksInProgress(0);
            overview.setCommentsCount(0);
            overview.setStudyTimeMinutes(0);
            overview.setDocumentsTrend(0);
            overview.setTasksTrend(0);
            overview.setCommentsTrend(0);
            overview.setStudyTimeTrend(0);
            overview.setCreatedAt(LocalDateTime.now());
            overview = userWeeklyOverviewService.createOrUpdate(overview);
        }
        profileData.put("overview", overview);

        return ResponseEntity.ok(ApiResponse.success(profileData));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfile>> updateProfile(@RequestBody UserProfile profile, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
        }

        profile.setUserId(userId);
        profile.setUpdatedAt(LocalDateTime.now());
        UserProfile updatedProfile = userProfileService.createOrUpdate(profile);
        return ResponseEntity.ok(ApiResponse.success(updatedProfile));
    }

    @PostMapping("/tags")
    public ResponseEntity<ApiResponse<UserTag>> addTag(@RequestBody UserTag tag, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
        }

        tag.setUserId(userId);
        UserTag createdTag = userTagService.create(tag);
        return ResponseEntity.ok(ApiResponse.success(createdTag));
    }

    @DeleteMapping("/tags/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTag(@PathVariable Long id, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
        }

        userTagService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/statistics")
    public ResponseEntity<ApiResponse<UserStatistics>> updateStatistics(@RequestBody UserStatistics statistics, HttpSession session) {
        Long userId = getUserIdFromSession(session);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("请先登录"));
        }

        statistics.setUserId(userId);
        statistics.setUpdatedAt(LocalDateTime.now());
        UserStatistics updatedStatistics = userStatisticsService.createOrUpdate(statistics);
        return ResponseEntity.ok(ApiResponse.success(updatedStatistics));
    }

    // 从会话中获取用户ID
    private Long getUserIdFromSession(HttpSession session) {
        // 先尝试从管理员会话获取
        Object adminObj = session.getAttribute("admin");
        if (adminObj != null) {
            try {
                // 假设Admin对象有getUser()方法，User对象有getId()方法
                Object userObj = adminObj.getClass().getMethod("getUser").invoke(adminObj);
                return (Long) userObj.getClass().getMethod("getId").invoke(userObj);
            } catch (Exception e) {
                // 忽略异常，尝试从普通用户会话获取
            }
        }

        // 从普通用户会话获取
        Object userObj = session.getAttribute("user");
        if (userObj != null) {
            try {
                return (Long) userObj.getClass().getMethod("getId").invoke(userObj);
            } catch (Exception e) {
                // 忽略异常
            }
        }

        return null;
    }
}