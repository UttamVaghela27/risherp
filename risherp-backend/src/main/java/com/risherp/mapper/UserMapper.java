package com.risherp.mapper;

import com.risherp.dto.auth.UserSummaryDto;
import com.risherp.dto.permission.PermissionResponse;
import com.risherp.dto.role.RoleSummaryDTO;
import com.risherp.dto.user.UserResponse;
import com.risherp.entity.Permission;
import com.risherp.entity.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    /**
     * Maps User to summary DTO for /api/auth/me.
     * Includes permissions list for frontend RBAC (Phase 17).
     */
    public UserSummaryDto toSummaryDto(User user) {
        if (user == null) {
            return null;
        }

        List<String> permissions = Collections.emptyList();
        if (user.getRole() != null && user.getRole().getPermissions() != null) {
            permissions = user.getRole().getPermissions().stream()
                    .map(Permission::getPermissionCode)
                    .collect(Collectors.toList());
        }

        return UserSummaryDto.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .businessId(user.getBusiness() != null ? user.getBusiness().getId() : null)
                .businessName(user.getBusiness() != null ? user.getBusiness().getBusinessName() : null)
                .permissions(permissions)
                .build();
    }

    /**
     * Maps User to full UserResponse for user management pages.
     */
    public UserResponse toUserResponse(User user, long usersCount) {
        if (user == null) return null;

        RoleSummaryDTO roleDto = null;
        if (user.getRole() != null) {
            roleDto = RoleSummaryDTO.builder()
                    .id(user.getRole().getId())
                    .name(user.getRole().getName())
                    .status(user.getRole().getStatus())
                    .build();
        }

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .status(user.getStatus())
                .role(roleDto)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public PermissionResponse toPermissionResponse(Permission permission) {
        if (permission == null) return null;
        return PermissionResponse.builder()
                .id(permission.getId())
                .permissionCode(permission.getPermissionCode())
                .permissionName(permission.getPermissionName())
                .module(permission.getModule())
                .description(permission.getDescription())
                .build();
    }
}
