package com.example.demo.controller;

import com.example.demo.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserPermissionController {

    private final PermissionService permissionService;

    // 撤销用户所有权限
    @DeleteMapping("/{userId}/permissions")
    public ResponseEntity<Void> revokeAllUserPermissions(@PathVariable Long userId) {
        permissionService.revokeAllPermissions(userId);
        return ResponseEntity.ok().build();
    }
}