package com.example.demo.controller;

import com.example.demo.model.*;
import com.example.demo.service.QuickCreateService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quick-create")
public class QuickCreateController {

    @Autowired
    private QuickCreateService quickCreateService;

    @PostMapping("/documents")
    public ResponseEntity<Material> createDocument(
            @RequestBody DocumentRequest request) {
        Material material = quickCreateService.createDocument(
                request.getTitle(),
                request.getTemplate(),
                request.getProjectId(),
                request.getCategory(),
                request.getLanguage(),
                request.getDescription(),
                request.getTags(),
                request.getVersion(),
                request.getOriginalFilename(),
                request.getCreatorId()
        );
        return ResponseEntity.ok(material);
    }

    @PostMapping("/projects")
    public ResponseEntity<Project> createProject(
            @RequestBody ProjectRequest request) {
        Project project = quickCreateService.createProject(
                request.getName(),
                request.getType(),
                request.getStatus(),
                request.getCreatorId()
        );
        return ResponseEntity.ok(project);
    }

    @PostMapping("/invites")
    public ResponseEntity<Invitation> inviteMembers(
            @RequestBody InvitationRequest request) {
        Invitation invitation = quickCreateService.inviteMembers(
                request.getContacts(),
                request.getRole(),
                request.getExpiryDays(),
                request.getInviterId()
        );
        return ResponseEntity.ok(invitation);
    }

    @PostMapping("/reports")
    public ResponseEntity<Report> generateReport(
            @RequestBody ReportRequest request) {
        Report report = quickCreateService.generateReport(
                request.getTitle(),
                request.getType(),
                request.getStartDate(),
                request.getEndDate(),
                request.getDescription(),
                request.getCreatorId()
        );
        return ResponseEntity.ok(report);
    }

    // 请求DTO类
    @Data
    public static class DocumentRequest {
        private String title;
        private String template;
        private Integer projectId;
        private String category;
        private String language;
        private String description;
        private List<String> tags;
        private String version;
        private String originalFilename;
        private Integer creatorId;
    }

    @Data
    public static class ProjectRequest {
        private String name;
        private String type;
        private String status;
        private Integer creatorId;
    }

    @Data
    public static class InvitationRequest {
        private List<String> contacts;
        private String role;
        private Integer expiryDays;
        private Integer inviterId;
    }

    @Data
    public static class ReportRequest {
        private String title;
        private String type;
        private String startDate;
        private String endDate;
        private String description;
        private Long creatorId;
    }
}