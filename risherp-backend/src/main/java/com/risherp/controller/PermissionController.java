package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.permission.PermissionGroupDTO;
import com.risherp.security.UserPrincipal;
import com.risherp.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Permission Controller — Phase 17
 * Provides the permission catalog for role management UI.
 */
@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService permissionService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW') or hasAuthority('ROLE_CREATE') or hasAuthority('ROLE_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PermissionGroupDTO>>> getAllPermissions(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PermissionGroupDTO> grouped = permissionService.getAllPermissionsGrouped();
        return ResponseEntity.ok(ApiResponse.success("Permissions retrieved", grouped));
    }
}
