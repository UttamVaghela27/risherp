package com.risherp.service;

import com.risherp.dto.permission.PermissionGroupDTO;

import java.util.List;

public interface PermissionService {
    List<PermissionGroupDTO> getAllPermissionsGrouped();
}
