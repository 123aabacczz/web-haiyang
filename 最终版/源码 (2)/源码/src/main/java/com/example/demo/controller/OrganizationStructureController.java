package com.example.demo.controller;

import com.example.demo.common.ApiResponse;
import com.example.demo.model.OrganizationStructure;
import com.example.demo.model.User;
import com.example.demo.service.OrganizationStructureService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organization")
@RequiredArgsConstructor
public class OrganizationStructureController {

    private final OrganizationStructureService organizationStructureService;

    private User getUserFromSession(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        return (User) session.getAttribute("user");
    }

    // 获取所有组织架构
    @GetMapping("/structure")
    public ApiResponse<List<OrganizationStructure>> getOrganizationStructure(HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        List<OrganizationStructure> organizationStructures = organizationStructureService.getAllOrganizationStructures();
        return ApiResponse.success(organizationStructures);
    }

    // 获取组织架构详情
    @GetMapping("/structure/{id}")
    public ApiResponse<OrganizationStructure> getOrganizationStructureById(@PathVariable("id") Long id, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        OrganizationStructure organizationStructure = organizationStructureService.getOrganizationStructureById(id);
        if (organizationStructure == null) {
            return ApiResponse.error("组织架构不存在");
        }
        return ApiResponse.success(organizationStructure);
    }

    // 创建组织架构
    @PostMapping("/structure")
    public ApiResponse<Long> createOrganizationStructure(@RequestBody OrganizationStructure organizationStructure, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        Long id = organizationStructureService.createOrganizationStructure(organizationStructure);
        return ApiResponse.success(id);
    }

    // 更新组织架构
    @PutMapping("/structure/{id}")
    public ApiResponse<Boolean> updateOrganizationStructure(@PathVariable("id") Long id, @RequestBody OrganizationStructure organizationStructure, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        organizationStructure.setId(id);
        boolean success = organizationStructureService.updateOrganizationStructure(organizationStructure);
        return ApiResponse.success(success);
    }

    // 删除组织架构
    @DeleteMapping("/structure/{id}")
    public ApiResponse<Boolean> deleteOrganizationStructure(@PathVariable("id") Long id, HttpServletRequest req) {
        User user = getUserFromSession(req);
        if (user == null) {
            return ApiResponse.error("请重新登录");
        }
        boolean success = organizationStructureService.deleteOrganizationStructure(id);
        return ApiResponse.success(success);
    }
}
