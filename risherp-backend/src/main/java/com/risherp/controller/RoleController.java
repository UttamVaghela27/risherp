package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.role.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Role Management Controller — Phase 17
 */
@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<RoleResponse>>> getAllRoles(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {

        Page<RoleResponse> result = roleService.getAllRoles(
                principal.getBusinessId(), search, status,
                PageRequest.of(page, size, Sort.by("name").ascending()));

        return ResponseEntity.ok(ApiResponse.success("Roles retrieved", PagedResponse.from(result)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Role retrieved",
                roleService.getRoleById(principal.getBusinessId(), id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_CREATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateRoleRequest request) {
        RoleResponse response = roleService.createRole(principal.getBusinessId(), request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Role created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role updated",
                roleService.updateRole(principal.getBusinessId(), id, request, principal.getId())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_STATUS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRoleStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role status updated",
                roleService.updateRoleStatus(principal.getBusinessId(), id, request.getStatus(), principal.getId())));
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasAuthority('ROLE_PERMISSION_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRolePermissions(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AssignPermissionsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role permissions updated",
                roleService.updateRolePermissions(principal.getBusinessId(), id, request, principal.getId())));
    }
}
