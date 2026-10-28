package com.example.demo.controller;

import com.example.demo.model.Permission;
import com.example.demo.service.PermissionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/permissions")
@RequiredArgsConstructor
public class PermissionController {
    private final PermissionService permissionService;

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<Permission>> getModulePermissions(
            @PathVariable Long moduleId) {
        return ResponseEntity.ok(permissionService.getModulePermissions(moduleId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Permission>> getUserPermissions(
            @PathVariable Long userId) {
        return ResponseEntity.ok(permissionService.getUserPermissions(userId));
    }

    @PostMapping("/assign")
    public ResponseEntity<Void> assignPermission(
            @RequestParam Long userId,
            @RequestParam Long permissionId) {
        permissionService.assignPermissionToUser(userId, permissionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/revoke")
    public ResponseEntity<Void> revokePermission(
            @RequestParam Long userId,
            @RequestParam Long permissionId) {
        permissionService.revokePermissionFromUser(userId, permissionId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/close-modal")
    public ResponseEntity<String> closeModal() {
        return ResponseEntity.ok("模态框已关闭");
    }

    // 新增：获取所有权限接口
    @GetMapping
    public ResponseEntity<List<Permission>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }

    // 创建权限接口
    @PostMapping
    public ResponseEntity<Permission> createPermission(
            @RequestBody PermissionRequest request
    ) {
        Permission permission = permissionService.createPermission(
                request.getName(),
                request.getDescription(),
                request.getModuleId() // 直接使用Long
        );
        return ResponseEntity.ok(permission);
    }

    @Data
    static class PermissionRequest {
        private String name;
        private String description;
        private Long moduleId; // 改为Long类型
    }

    @PutMapping("/{id}")
    public ResponseEntity<Permission> updatePermission(
            @PathVariable Long id,
            @RequestBody Permission permission) {
        permission.setId(id);
        return ResponseEntity.ok(permissionService.updatePermission(permission));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.ok().build();
    }
}