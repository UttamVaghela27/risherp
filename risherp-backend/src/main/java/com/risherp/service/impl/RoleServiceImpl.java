package com.risherp.service.impl;

import com.risherp.dto.permission.PermissionResponse;
import com.risherp.dto.role.*;
import com.risherp.entity.Permission;
import com.risherp.entity.Role;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.PermissionRepository;
import com.risherp.repository.RoleRepository;
import com.risherp.repository.UserRepository;
import com.risherp.service.AuditLogService;
import com.risherp.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<RoleResponse> getAllRoles(Long businessId, String search, String status, Pageable pageable) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        String cleanStatus = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        return roleRepository.findByBusinessIdFiltered(businessId, cleanSearch, cleanStatus, pageable)
                .map(role -> toResponse(role, businessId));
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long businessId, Long roleId) {
        Role role = roleRepository.findByIdWithPermissions(roleId)
                .filter(r -> r.getBusiness() != null && r.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));
        return toResponse(role, businessId);
    }

    @Override
    @Transactional
    public RoleResponse createRole(Long businessId, CreateRoleRequest request, Long currentUserId) {
        String roleName = request.getRoleName().trim().toUpperCase();

        if (roleRepository.findByNameAndBusinessId(roleName, businessId).isPresent()) {
            throw new DuplicateResourceException("A role with name '" + roleName + "' already exists");
        }

        var business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        Set<Permission> permissions = resolvePermissions(request.getPermissionIds());

        Role role = Role.builder()
                .business(business)
                .name(roleName)
                .description(request.getDescription())
                .status("ACTIVE")
                .permissions(permissions)
                .build();

        role = roleRepository.save(role);
        auditLogService.log(currentUserId, null, businessId, "ROLE", "ROLE_CREATE",
                role.getId().toString(), "Created role: " + roleName, null);

        return toResponse(role, businessId);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long businessId, Long roleId, UpdateRoleRequest request, Long currentUserId) {
        Role role = findRoleForBusiness(businessId, roleId);
        String newName = request.getRoleName().trim().toUpperCase();

        // Check name uniqueness if changed
        if (!role.getName().equals(newName)) {
            roleRepository.findByNameAndBusinessId(newName, businessId).ifPresent(r -> {
                throw new DuplicateResourceException("Role name '" + newName + "' already in use");
            });
        }

        role.setName(newName);
        role.setDescription(request.getDescription());
        role.setPermissions(resolvePermissions(request.getPermissionIds()));
        role = roleRepository.save(role);

        auditLogService.log(currentUserId, null, businessId, "ROLE", "ROLE_UPDATE",
                roleId.toString(), "Updated role: " + newName, null);
        return toResponse(role, businessId);
    }

    @Override
    @Transactional
    public RoleResponse updateRoleStatus(Long businessId, Long roleId, String status, Long currentUserId) {
        Role role = findRoleForBusiness(businessId, roleId);

        if ("INACTIVE".equalsIgnoreCase(status)) {
            // Safety: prevent deactivating if it would leave no active admins
            long usersWithRole = userRepository.countByRoleIdAndBusinessId(roleId, businessId);
            if (usersWithRole > 0 && "ADMIN".equals(role.getName())) {
                long activeAdmins = userRepository.countActiveAdmins(businessId);
                if (activeAdmins <= usersWithRole) {
                    throw new BadRequestException("Cannot deactivate ADMIN role — it would leave no active administrators");
                }
            }
        }

        role.setStatus(status.toUpperCase());
        role = roleRepository.save(role);

        auditLogService.log(currentUserId, null, businessId, "ROLE", "ROLE_STATUS_UPDATE",
                roleId.toString(), "Changed role " + role.getName() + " status to " + status, null);
        return toResponse(role, businessId);
    }

    @Override
    @Transactional
    public RoleResponse updateRolePermissions(Long businessId, Long roleId, AssignPermissionsRequest request, Long currentUserId) {
        Role role = findRoleForBusiness(businessId, roleId);
        role.setPermissions(resolvePermissions(request.getPermissionIds()));
        role = roleRepository.save(role);

        auditLogService.log(currentUserId, null, businessId, "ROLE", "ROLE_PERMISSION_UPDATE",
                roleId.toString(), "Updated permissions for role: " + role.getName(), null);
        return toResponse(role, businessId);
    }

    // --- Helpers ---

    private Role findRoleForBusiness(Long businessId, Long roleId) {
        return roleRepository.findByIdWithPermissions(roleId)
                .filter(r -> r.getBusiness() != null && r.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));
    }

    private Set<Permission> resolvePermissions(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(permissionRepository.findAllById(ids));
    }

    private RoleResponse toResponse(Role role, Long businessId) {
        long usersCount = 0;
        try {
            usersCount = userRepository.countByRoleIdAndBusinessId(role.getId(), businessId);
        } catch (Exception e) {
            log.warn("Could not count users for role {}: {}", role.getId(), e.getMessage());
        }

        List<PermissionResponse> permissions = Collections.emptyList();
        if (role.getPermissions() != null) {
            permissions = role.getPermissions().stream()
                    .filter(Objects::nonNull)
                    .sorted(Comparator.comparing(
                            (Permission p) -> p.getModule() != null ? p.getModule() : "",
                            String.CASE_INSENSITIVE_ORDER
                    ).thenComparing(
                            (Permission p) -> p.getPermissionName() != null ? p.getPermissionName() : "",
                            String.CASE_INSENSITIVE_ORDER
                    ))
                    .map(p -> PermissionResponse.builder()
                            .id(p.getId())
                            .permissionCode(p.getPermissionCode())
                            .permissionName(p.getPermissionName())
                            .module(p.getModule())
                            .description(p.getDescription())
                            .build())
                    .collect(Collectors.toList());
        }

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .status(role.getStatus())
                .permissions(permissions)
                .usersCount(usersCount)
                .createdAt(role.getCreatedAt())
                .updatedAt(role.getUpdatedAt())
                .build();
    }
}
