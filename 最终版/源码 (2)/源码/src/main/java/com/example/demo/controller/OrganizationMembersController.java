package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.OrganizationMembers;
import com.example.demo.model.User;
import com.example.demo.service.OrganizationMembersService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organization-members")
@RequiredArgsConstructor
public class OrganizationMembersController {

    private final OrganizationMembersService organizationMembersService;

    private User getUserFromSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute("user");
    }

    // 获取组织成员列表
    @GetMapping("/org/{orgId}")
    public ApiResponse<List<OrganizationMembers>> getOrganizationMembersByOrgId(@PathVariable("orgId") Long orgId, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        List<OrganizationMembers> organizationMembers = organizationMembersService.getOrganizationMembersByOrgId(orgId);
        return ApiResponse.success(organizationMembers);
    }

    // 创建组织成员
    @PostMapping
    public ApiResponse<Long> createOrganizationMember(@RequestBody OrganizationMembers organizationMembers, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        Long id = organizationMembersService.createOrganizationMember(organizationMembers);
        return ApiResponse.success(id);
    }

    // 更新组织成员
    @PutMapping("/{id}")
    public ApiResponse<Boolean> updateOrganizationMember(@PathVariable("id") Long id, @RequestBody OrganizationMembers organizationMembers, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        organizationMembers.setId(id);
        boolean success = organizationMembersService.updateOrganizationMember(organizationMembers);
        return ApiResponse.success(success);
    }

    // 删除组织成员
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteOrganizationMember(@PathVariable("id") Long id, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        boolean success = organizationMembersService.deleteOrganizationMember(id);
        return ApiResponse.success(success);
    }
}
