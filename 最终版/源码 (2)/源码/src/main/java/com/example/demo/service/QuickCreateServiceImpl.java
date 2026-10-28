package com.example.demo.service;

import com.example.demo.mapper.*;
import com.example.demo.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class QuickCreateServiceImpl implements QuickCreateService {

    @Autowired
    private MaterialMapper materialMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private InvitationMapper invitationMapper;

    @Autowired
    private ReportMapper reportMapper;

    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional
    public Material createDocument(String title, String template, Integer projectId, String category,
                                   String language, String description, List<String> tags, String version,
                                   String originalFilename, Integer creatorId) {
        Material material = new Material();
        material.setName(title);
        material.setType(template);
        material.setProjectId(projectId != null ? projectId.longValue() : null);
        material.setCategory(category);
        material.setLanguage(language);
        material.setDescription(description);
        material.setTags(String.join(",", tags));
        material.setVersion(version);
        material.setOriginalFilename(originalFilename);
        material.setUploaderId(creatorId != null ? creatorId.longValue() : null);
        material.setUploaderName("未知用户"); // 设置默认值
        material.setStatus(0);
        material.setUploadTime(LocalDateTime.now());
        material.setFileSize(0L); // 设置默认值
        material.setDownloadCount(0); // 设置默认值
        material.setViewCount(0); // 设置默认值
        material.setPath(""); // 新增：设置path字段为空字符串，避免null

        materialMapper.insertMaterial(material);
        return material;
    }

    @Override
    @Transactional
    public Project createProject(String name, String type, String status, Integer creatorId) {
        Project project = new Project();
        project.setName(name);
        project.setType(type);
        project.setStatus(status);
        project.setCreatorId(creatorId);
        project.setCreatedAt(LocalDateTime.now());

        projectMapper.insert(project);
        return project;
    }

    @Override
    @Transactional
    public Invitation inviteMembers(List<String> contacts, String role, Integer expiryDays, Integer inviterId) {
        Invitation invitation = new Invitation();
        invitation.setInviteeEmails(contacts);
        invitation.setRole(role);
        invitation.setInviterId(inviterId);
        invitation.setStatus("pending");
        invitation.setCreatedAt(LocalDateTime.now());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(expiryDays != null ? expiryDays : 7));

        invitationMapper.insert(invitation);
        return invitation;
    }

    @Override
    @Transactional
    public Report generateReport(String title, String type, String startDate, String endDate,
                                 String description, Long creatorId) {
        Report report = new Report();
        report.setTitle(title);
        report.setType(type);
        report.setStartDate(java.time.LocalDate.parse(startDate));
        report.setEndDate(java.time.LocalDate.parse(endDate));
        report.setContent(description);
        report.setCreatorId(creatorId);
        report.setSubmitTime(LocalDateTime.now());
        report.setStatus(0); // 初始状态

        reportMapper.insert(report);

        // 异步生成PDF文件
        new Thread(() -> {
            try {
                // 模拟PDF生成过程
                Thread.sleep(5000);
                String filePath = "/reports/" + report.getId() + ".pdf";
                reportMapper.updateFilePath(report.getId(), filePath);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }).start();

        return report;
    }
}