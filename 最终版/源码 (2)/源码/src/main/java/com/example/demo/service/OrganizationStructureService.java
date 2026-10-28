package com.example.demo.service;

import com.example.demo.model.OrganizationStructure;
import com.example.demo.model.OrganizationMembers;

import java.util.List;

public interface OrganizationStructureService {
    List<OrganizationStructure> getAllOrganizationStructures();
    OrganizationStructure getOrganizationStructureById(Long id);
    List<OrganizationStructure> getOrganizationStructuresByParentId(Long parentId);
    List<OrganizationStructure> getOrganizationStructuresByTeamId(Long teamId);
    List<OrganizationMembers> getOrganizationMembersByOrgId(Long orgId);
    Long createOrganizationStructure(OrganizationStructure organizationStructure);
    boolean updateOrganizationStructure(OrganizationStructure organizationStructure);
    boolean deleteOrganizationStructure(Long id);
}
