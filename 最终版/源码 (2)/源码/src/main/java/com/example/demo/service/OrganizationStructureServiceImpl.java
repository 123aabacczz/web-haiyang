package com.example.demo.service;

import com.example.demo.mapper.OrganizationStructureMapper;
import com.example.demo.mapper.OrganizationMembersMapper;
import com.example.demo.model.OrganizationStructure;
import com.example.demo.model.OrganizationMembers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationStructureServiceImpl implements OrganizationStructureService {
    private final OrganizationStructureMapper organizationStructureMapper;
    private final OrganizationMembersMapper organizationMembersMapper;

    @Override
    public List<OrganizationStructure> getAllOrganizationStructures() {
        return organizationStructureMapper.selectAll();
    }

    @Override
    public OrganizationStructure getOrganizationStructureById(Long id) {
        OrganizationStructure organizationStructure = organizationStructureMapper.selectById(id);
        if (organizationStructure != null) {
            // 加载关联的组织成员
            List<OrganizationMembers> members = organizationMembersMapper.selectByOrgId(id);
            // 过滤掉null成员
            members = members.stream().filter(member -> member != null).collect(java.util.stream.Collectors.toList());
            organizationStructure.setMembers(members);
            organizationStructure.setMember_count(members.size());
        }
        return organizationStructure;
    }

    @Override
    public List<OrganizationStructure> getOrganizationStructuresByParentId(Long parentId) {
        return organizationStructureMapper.selectByParentId(parentId);
    }

    @Override
    public List<OrganizationStructure> getOrganizationStructuresByTeamId(Long teamId) {
        return organizationStructureMapper.selectByTeamId(teamId);
    }

    @Override
    public List<OrganizationMembers> getOrganizationMembersByOrgId(Long orgId) {
        List<OrganizationMembers> members = organizationMembersMapper.selectByOrgId(orgId);
        // 过滤掉null成员
        return members.stream().filter(member -> member != null).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Long createOrganizationStructure(OrganizationStructure organizationStructure) {
        organizationStructureMapper.insert(organizationStructure);
        return organizationStructure.getId();
    }

    @Override
    public boolean updateOrganizationStructure(OrganizationStructure organizationStructure) {
        return organizationStructureMapper.update(organizationStructure);
    }

    @Override
    public boolean deleteOrganizationStructure(Long id) {
        return organizationStructureMapper.delete(id);
    }
}
