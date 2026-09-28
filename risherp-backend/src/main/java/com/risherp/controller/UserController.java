package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.user.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.UserService;
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
 * User Management Controller — Phase 17
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long roleId,
            @RequestParam(required = false) String status) {

        Page<UserResponse> result = userService.getAllUsers(
                principal.getBusinessId(), search, roleId, status,
                PageRequest.of(page, size, Sort.by("name").ascending()));

        return ResponseEntity.ok(ApiResponse.success("Users retrieved", PagedResponse.from(result)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved",
                userService.getUserById(principal.getBusinessId(), id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_CREATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(principal.getBusinessId(), request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User updated",
                userService.updateUser(principal.getBusinessId(), id, request, principal.getId())));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('USER_STATUS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User status updated",
                userService.updateUserStatus(principal.getBusinessId(), id, request.getStatus(), principal.getId())));
    }

    @PutMapping("/{id}/password")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasRole('ADMIN') or #id == authentication.principal.id")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(principal.getBusinessId(), id, request, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('USER_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Role assigned",
                userService.assignRole(principal.getBusinessId(), id, request.getRoleId(), principal.getId())));
    }
}
