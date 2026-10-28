package com.example.demo.service;

import com.example.demo.mapper.OrganizationMembersMapper;
import com.example.demo.model.OrganizationMembers;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationMembersServiceImpl implements OrganizationMembersService {
    private final OrganizationMembersMapper organizationMembersMapper;

    @Override
    public List<OrganizationMembers> getOrganizationMembersByOrgId(Long orgId) {
        List<OrganizationMembers> members = organizationMembersMapper.selectByOrgId(orgId);
        // 过滤掉null成员
        return members.stream().filter(member -> member != null).collect(java.util.stream.Collectors.toList());
    }

    @Override
    public OrganizationMembers getOrganizationMemberByOrgIdAndTeamMemberId(Long orgId, Long teamMemberId) {
        return organizationMembersMapper.selectByOrgIdAndTeamMemberId(orgId, teamMemberId);
    }

    @Override
    public Long createOrganizationMember(OrganizationMembers organizationMembers) {
        organizationMembersMapper.insert(organizationMembers);
        return organizationMembers.getId();
    }

    @Override
    public boolean updateOrganizationMember(OrganizationMembers organizationMembers) {
        return organizationMembersMapper.update(organizationMembers);
    }

    @Override
    public boolean deleteOrganizationMember(Long id) {
        return organizationMembersMapper.delete(id);
    }

    @Override
    public boolean deleteOrganizationMembersByOrgId(Long orgId) {
        return organizationMembersMapper.deleteByOrgId(orgId);
    }

    @Override
    public boolean deleteOrganizationMembersByTeamMemberId(Long teamMemberId) {
        return organizationMembersMapper.deleteByTeamMemberId(teamMemberId);
    }
}
