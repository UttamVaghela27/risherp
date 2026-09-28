package com.risherp.service.impl;

import com.risherp.dto.permission.PermissionGroupDTO;
import com.risherp.dto.permission.PermissionResponse;
import com.risherp.entity.Permission;
import com.risherp.repository.PermissionRepository;
import com.risherp.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PermissionGroupDTO> getAllPermissionsGrouped() {
        List<Permission> all = permissionRepository.findAllByOrderByModuleAscPermissionNameAsc();

        Map<String, List<PermissionResponse>> grouped = new LinkedHashMap<>();
        for (Permission p : all) {
            grouped.computeIfAbsent(p.getModule(), k -> new ArrayList<>())
                   .add(PermissionResponse.builder()
                           .id(p.getId())
                           .permissionCode(p.getPermissionCode())
                           .permissionName(p.getPermissionName())
                           .module(p.getModule())
                           .description(p.getDescription())
                           .build());
        }

        return grouped.entrySet().stream()
                .map(e -> PermissionGroupDTO.builder()
                        .module(e.getKey())
                        .permissions(e.getValue())
                        .build())
                .collect(Collectors.toList());
    }
}
