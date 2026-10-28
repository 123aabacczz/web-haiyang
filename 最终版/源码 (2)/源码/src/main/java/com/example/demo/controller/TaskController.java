package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.Admin;
import com.example.demo.model.Material;
import com.example.demo.model.Task;
import com.example.demo.model.User; // 需要导入User模型
import com.example.demo.service.AdminService;
import com.example.demo.service.FileService;
import com.example.demo.service.MaterialService;
import com.example.demo.service.TaskService;
import com.example.demo.service.UserService; // 需要导入UserService
import com.example.demo.util.PageInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@Slf4j
public class TaskController {

    @Autowired
    private TaskService taskService;
    @Autowired
    private MaterialService materialService;
    @Autowired
    private FileService fileService;
    @Autowired
    private UserService userService; // 添加UserService依赖
    @Autowired
    private AdminService adminService; // 添加AdminService依赖

    @GetMapping("/{id}")
    public ApiResponse<Task> getTask(@PathVariable Long id) {
        try {
            Task task = taskService.getTaskById(id);

            // 确保返回完整信息
            if (task != null) {
                // 如果需要，可以在这里添加关联数据的加载
                if (task.getAssigneeId() != null) {
                    // 可以加载负责人名称等信息
                    User assignee = userService.getUserById(task.getAssigneeId());
                    if (assignee != null) {
                        // 可以将负责人信息添加到响应中或设置到task对象中
                    }
                }
            }

            return ApiResponse.success(task);
        } catch (Exception e) {
            return ApiResponse.error("获取任务失败: " + e.getMessage());
        }
    }

    @GetMapping("/assignees")
    public ApiResponse<List<User>> getAdminUsers() {
        try {
            // 使用 AdminService 获取所有用户
            PageInfo<User> userPage = adminService.getAllUsers(1, 100, null);
            List<User> users = userPage.getItems();
            // 移除密码等敏感信息
            users.forEach(user -> user.setPassword(null));
            return ApiResponse.success(users);
        } catch (Exception e) {
            log.error("获取管理员列表失败", e);
            return ApiResponse.success(new ArrayList<>());
        }
    }

    @GetMapping
    public ApiResponse<PageInfo<Task>> getTasks(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) { // 修改默认size为1000
        try {
            PageInfo<Task> tasks = taskService.getTasks(status, priority, keyword, page, size);
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            return ApiResponse.error("获取任务列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ApiResponse<PageInfo<Task>> getPendingTasks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        try {
            PageInfo<Task> tasks = taskService.getPendingTasks(page, size);
            return ApiResponse.success(tasks);
        } catch (Exception e) {
            return ApiResponse.error("获取待审核任务失败: " + e.getMessage());
        }
    }

    @PostMapping
    public ApiResponse<Task> createTask(
            @RequestParam(required = false) Long materialId,
            @RequestParam(required = false) MultipartFile attachment,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String assigneeId, // 修改为String类型，支持用户名
            @RequestParam Integer priority,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) Integer reward,
            @RequestParam(required = false) String deadline,
            HttpServletRequest request) {
        try {
            HttpSession session = request.getSession();
            Admin admin = (Admin) session.getAttribute("admin");
            User user = (User) session.getAttribute("user");

            // 调试：打印会话中的所有属性
            Enumeration<String> attributeNames = request.getSession().getAttributeNames();
            while (attributeNames.hasMoreElements()) {
                String attributeName = attributeNames.nextElement();
                log.debug("Session attribute: {} = {}", attributeName, request.getSession().getAttribute(attributeName));
            }

            // 获取当前用户ID
            Long currentUserId = null;
            if (admin != null) {
                currentUserId = admin.getUser().getId();
            } else if (user != null) {
                currentUserId = user.getId();
            }

            if (currentUserId == null) {
                return ApiResponse.error("用户未登录");
            }

            // 检查用户是否存在
            User currentUser = userService.getUserById(currentUserId);
            if (currentUser == null) {
                return ApiResponse.error("用户不存在");
            }
            
            // 检查用户角色是否为管理员或普通用户
            boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().contains("admin");
            boolean isUser = "user".equals(currentUser.getRole());
            if (!isAdmin && !isUser) {
                return ApiResponse.error("没有权限创建任务");
            }

            // 处理 assigneeId，可以是数字ID或用户名
            Long actualAssigneeId = null;
            try {
                // 尝试将 assigneeId 转换为数字
                actualAssigneeId = Long.parseLong(assigneeId);
            } catch (NumberFormatException e) {
                // 如果转换失败，说明是用户名，根据用户名查找用户ID
                user = userService.findByUsername(assigneeId);
                if (user != null) {
                    actualAssigneeId = user.getId();
                } else {
                    return ApiResponse.error("找不到指定的负责人");
                }
            }

            log.info("开始创建任务，参数: title={}, description={}, assigneeId={}, priority={}, tags={}, reward={}, deadline={}", 
                title, description, assigneeId, priority, tags, reward, deadline);
            
            Task task = new Task();
            task.setTitle(title);
            task.setDescription(description);
            task.setAssigneeId(actualAssigneeId);
            task.setPriority(priority);
            task.setTags(tags);
            task.setReward(reward != null ? reward : 10); // 默认奖励值为10
            
            // 处理截止日期
            if (deadline != null && !deadline.isEmpty()) {
                try {
                    task.setEndTime(LocalDateTime.parse(deadline));
                    log.info("截止日期设置为: {}", task.getEndTime());
                } catch (Exception e) {
                    log.warn("日期格式错误，忽略截止日期: {}", e.getMessage());
                }
            }
            
            task.setCreatorId(currentUserId);
            // 设置创建者名称，根据登录类型获取
            if (admin != null) {
                task.setCreatorName(admin.getUser().getUsername());
            } else if (user != null) {
                task.setCreatorName(user.getUsername());
            }
            task.setMaterialId(materialId);
            // 设置默认进度
            task.setProgress(0);

            log.info("任务对象创建完成: {}", task);

            // 处理materialId或attachment
            if (materialId != null) {
                Material material = materialService.getMaterialById(materialId);
                if (material != null) {
                    task.setAttachmentUrl(material.getPath());
                    log.info("设置附件URL: {}", material.getPath());
                } else {
                    log.warn("Material with ID {} not found", materialId);
                }
            } else if (attachment != null && !attachment.isEmpty()) {
                String fileUrl = fileService.saveFile(attachment);
                task.setAttachmentUrl(fileUrl);
                log.info("上传附件并设置URL: {}", fileUrl);
            }

            log.info("开始调用taskService.createTask");
            Task createdTask = taskService.createTask(task);
            log.info("任务创建成功，ID: {}", createdTask.getId());
            
            return ApiResponse.success("任务创建成功", createdTask);
        } catch (Exception e) {
            log.error("创建任务失败", e);
            return ApiResponse.error("创建任务失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        try {
            task.setId(id);
            Task updatedTask = taskService.updateTask(task);
            return ApiResponse.success("任务更新成功", updatedTask);
        } catch (Exception e) {
            return ApiResponse.error("更新任务失败: " + e.getMessage());
        }
    }
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTask(@PathVariable Long id) {
        try {
            taskService.deleteTask(id);
            return ApiResponse.success("任务删除成功");
        } catch (Exception e) {
            return ApiResponse.error("删除任务失败: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/review")
    public ApiResponse<Task> reviewTask(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            HttpServletRequest request) {
        try {
            Integer status = (Integer) requestBody.get("status");
            String reviewComment = (String) requestBody.get("reviewComment");

            // 从会话中获取管理员信息
            HttpSession session = request.getSession();
            Admin admin = (Admin) session.getAttribute("admin");
            if (admin == null) {
                return ApiResponse.error("用户未登录");
            }

            // 使用管理员对应的用户ID作为审核人ID
            Long reviewerId = admin.getUser().getId();

            Task reviewedTask = taskService.reviewTask(id, status, reviewerId, reviewComment);
            String message = status.equals(1) ? "任务审核通过" : "任务已拒绝";
            return ApiResponse.success(message, reviewedTask);
        } catch (Exception e) {
            return ApiResponse.error("审核任务失败: " + e.getMessage());
        }
    }
}