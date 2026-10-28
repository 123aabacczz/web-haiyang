package com.example.demo.service;

import com.example.demo.mapper.PermissionMapper;
import com.example.demo.mapper.UserPermissionMapper;
import com.example.demo.model.Permission;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final PermissionMapper permissionMapper;
    private final UserPermissionMapper userPermissionMapper;

    public List<Permission> getModulePermissions(Long moduleId) {
        return permissionMapper.selectByModuleId(moduleId);
    }

    public List<Permission> getUserPermissions(Long userId) {
        return permissionMapper.selectByUserId(userId);
    }

    // ✅ 新增：为用户分配权限
    public void assignPermissionToUser(Long userId, Long permissionId) {
        permissionMapper.assignPermissionToUser(userId, permissionId);
    }

    // ✅ 新增：撤销用户权限
    public void revokePermissionFromUser(Long userId, Long permissionId) {
        permissionMapper.revokePermissionFromUser(userId, permissionId);
    }

    public List<Permission> getAllPermissions() {
        return permissionMapper.selectAll();
    }

    public Permission createPermission(String name, String description, Long moduleId) { // 改为Long类型
        Permission permission = new Permission();
        permission.setName(name);
        permission.setDescription(description);
        permission.setModuleId(moduleId); // 直接使用Long类型

        permissionMapper.insert(permission);
        return permission;
    }

    public Permission updatePermission(Permission permission) {
        permissionMapper.updatePermission(permission);
        return permission;
    }

    public void deletePermission(Long id) {
        permissionMapper.deletePermission(id);
    }

    public void revokeAllPermissions(Long userId) {
        userPermissionMapper.deleteAllByUserId(userId);
    }
}