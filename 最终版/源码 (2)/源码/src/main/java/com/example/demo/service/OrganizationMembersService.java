package com.example.demo.service;

import com.example.demo.model.OrganizationMembers;

import java.util.List;

public interface OrganizationMembersService {
    List<OrganizationMembers> getOrganizationMembersByOrgId(Long orgId);
    OrganizationMembers getOrganizationMemberByOrgIdAndTeamMemberId(Long orgId, Long teamMemberId);
    Long createOrganizationMember(OrganizationMembers organizationMembers);
    boolean updateOrganizationMember(OrganizationMembers organizationMembers);
    boolean deleteOrganizationMember(Long id);
    boolean deleteOrganizationMembersByOrgId(Long orgId);
    boolean deleteOrganizationMembersByTeamMemberId(Long teamMemberId);
}
