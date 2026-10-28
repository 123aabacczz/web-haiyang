package com.example.demo.service;

import com.example.demo.model.Invitation;
import com.example.demo.model.Material;
import com.example.demo.model.Project;
import com.example.demo.model.Report;

import java.util.List;

public interface QuickCreateService {
    Material createDocument(String title, String template, Integer projectId, String category,
                            String language, String description, List<String> tags, String version,
                            String originalFilename, Integer creatorId);

    Project createProject(String name, String type, String status, Integer creatorId);

    Invitation inviteMembers(List<String> contacts, String role, Integer expiryDays, Integer inviterId);

    Report generateReport(String title, String type, String startDate, String endDate,
                          String description, Long creatorId);
}