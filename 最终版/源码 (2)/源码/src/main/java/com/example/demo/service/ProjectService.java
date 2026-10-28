// ProjectService.java
package com.example.demo.service;

import com.example.demo.model.Project;
import com.example.demo.mapper.ProjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectMapper projectMapper;

    public List<Project> getProjectsByUserId(Long userId) {
        return projectMapper.findByCreatorId(userId);
    }

    public Project getProjectById(Integer id) {
        return projectMapper.selectById(id);
    }
}