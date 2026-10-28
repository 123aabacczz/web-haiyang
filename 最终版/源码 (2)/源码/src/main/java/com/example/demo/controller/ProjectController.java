// ProjectController.java
package com.example.demo.controller;

import com.example.demo.model.Project;
import com.example.demo.model.User;
import com.example.demo.service.ProjectService;
import com.example.demo.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // 获取用户项目列表
    @GetMapping("/my-projects")
    public ResponseEntity<ApiResponse<List<Project>>> getUserProjects(HttpServletRequest request) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("用户未登录"));
        }

        List<Project> projects = projectService.getProjectsByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(projects));
    }

    // 获取项目详情
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Project>> getProject(@PathVariable Integer id, HttpServletRequest request) {
        HttpSession session = request.getSession();
        User user = (User) session.getAttribute("user");

        if (user == null) {
            return ResponseEntity.ok(ApiResponse.error("用户未登录"));
        }

        Project project = projectService.getProjectById(id);

        // 检查用户是否有权限访问此项目
        if (project != null && !project.getCreatorId().equals(user.getId())) {
            return ResponseEntity.ok(ApiResponse.error("无权访问此项目"));
        }

        return ResponseEntity.ok(ApiResponse.success(project));
    }
}