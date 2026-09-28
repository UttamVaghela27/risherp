package com.risherp.service;

import com.risherp.dto.user.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    Page<UserResponse> getAllUsers(Long businessId, String search, Long roleId, String status, Pageable pageable);
    UserResponse getUserById(Long businessId, Long userId);
    UserResponse createUser(Long businessId, CreateUserRequest request, Long currentUserId);
    UserResponse updateUser(Long businessId, Long userId, UpdateUserRequest request, Long currentUserId);
    UserResponse updateUserStatus(Long businessId, Long userId, String status, Long currentUserId);
    void changePassword(Long businessId, Long userId, ChangePasswordRequest request, Long currentUserId);
    UserResponse assignRole(Long businessId, Long userId, Long roleId, Long currentUserId);
}
