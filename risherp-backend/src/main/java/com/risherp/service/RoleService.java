package com.risherp.service;

import com.risherp.dto.role.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RoleService {
    Page<RoleResponse> getAllRoles(Long businessId, String search, String status, Pageable pageable);
    RoleResponse getRoleById(Long businessId, Long roleId);
    RoleResponse createRole(Long businessId, CreateRoleRequest request, Long currentUserId);
    RoleResponse updateRole(Long businessId, Long roleId, UpdateRoleRequest request, Long currentUserId);
    RoleResponse updateRoleStatus(Long businessId, Long roleId, String status, Long currentUserId);
    RoleResponse updateRolePermissions(Long businessId, Long roleId, AssignPermissionsRequest request, Long currentUserId);
}
