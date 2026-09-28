package com.risherp.service.impl;

import com.risherp.dto.user.*;
import com.risherp.entity.Business;
import com.risherp.entity.Role;
import com.risherp.entity.User;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.mapper.UserMapper;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.RoleRepository;
import com.risherp.repository.UserRepository;
import com.risherp.service.AuditLogService;
import com.risherp.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BusinessRepository businessRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Long businessId, String search, Long roleId, String status, Pageable pageable) {
        return userRepository.findByBusinessId(businessId, pageable)
                .map(user -> userMapper.toUserResponse(user, 0));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long businessId, Long userId) {
        User user = userRepository.findByIdAndBusinessIdWithRole(userId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return userMapper.toUserResponse(user, 0);
    }

    @Override
    @Transactional
    public UserResponse createUser(Long businessId, CreateUserRequest request, Long currentUserId) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A user already exists with email: " + email);
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (userRepository.existsByUsernameAndBusinessId(request.getUsername().trim(), businessId)) {
                throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
            }
        }

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        Role role = roleRepository.findById(request.getRoleId())
                .filter(r -> r.getBusiness() != null && r.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRoleId()));

        if ("INACTIVE".equalsIgnoreCase(role.getStatus())) {
            throw new BadRequestException("Cannot assign an inactive role to a user");
        }

        User user = User.builder()
                .business(business)
                .name(request.getFullName().trim())
                .username(request.getUsername() != null ? request.getUsername().trim() : null)
                .email(email)
                .mobile(request.getMobile())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status("ACTIVE")
                .build();

        user = userRepository.save(user);

        auditLogService.log(currentUserId, null, businessId, "USER", "USER_CREATE",
                user.getId().toString(), "Created user: " + email + " with role: " + role.getName(), null);

        return userMapper.toUserResponse(user, 0);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long businessId, Long userId, UpdateUserRequest request, Long currentUserId) {
        User user = findUserForBusiness(businessId, userId);
        String newEmail = request.getEmail().trim().toLowerCase();

        if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("Email '" + newEmail + "' is already in use");
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !request.getUsername().trim().equals(user.getUsername())) {
            if (userRepository.existsByUsernameAndBusinessId(request.getUsername().trim(), businessId)) {
                throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
            }
        }

        Role role = roleRepository.findById(request.getRoleId())
                .filter(r -> r.getBusiness() != null && r.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        user.setName(request.getFullName().trim());
        user.setUsername(request.getUsername() != null ? request.getUsername().trim() : null);
        user.setEmail(newEmail);
        user.setMobile(request.getMobile());
        user.setRole(role);

        user = userRepository.save(user);

        auditLogService.log(currentUserId, null, businessId, "USER", "USER_UPDATE",
                userId.toString(), "Updated user: " + newEmail, null);
        return userMapper.toUserResponse(user, 0);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long businessId, Long userId, String status, Long currentUserId) {
        User user = findUserForBusiness(businessId, userId);

        // Self-deactivation prevention
        if (userId.equals(currentUserId) && "INACTIVE".equalsIgnoreCase(status)) {
            throw new BadRequestException("You cannot deactivate your own account");
        }

        // Last admin protection
        if ("INACTIVE".equalsIgnoreCase(status) && "ADMIN".equals(user.getRole().getName())) {
            long activeAdmins = userRepository.countActiveAdmins(businessId);
            if (activeAdmins <= 1) {
                throw new BadRequestException("Cannot deactivate the only active administrator");
            }
        }

        user.setStatus(status.toUpperCase());
        user = userRepository.save(user);

        auditLogService.log(currentUserId, null, businessId, "USER", "USER_STATUS_UPDATE",
                userId.toString(), "Changed user " + user.getEmail() + " status to " + status, null);
        return userMapper.toUserResponse(user, 0);
    }

    @Override
    @Transactional
    public void changePassword(Long businessId, Long userId, ChangePasswordRequest request, Long currentUserId) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        User user = findUserForBusiness(businessId, userId);

        // If changing own password, require current password
        if (userId.equals(currentUserId)) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new BadRequestException("Current password is incorrect");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.log(currentUserId, null, businessId, "USER", "PASSWORD_CHANGE",
                userId.toString(), "Password changed for user: " + user.getEmail(), null);
    }

    @Override
    @Transactional
    public UserResponse assignRole(Long businessId, Long userId, Long roleId, Long currentUserId) {
        User user = findUserForBusiness(businessId, userId);

        Role role = roleRepository.findById(roleId)
                .filter(r -> r.getBusiness() != null && r.getBusiness().getId().equals(businessId))
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        // Self role removal prevention for admins
        if (userId.equals(currentUserId) && "ADMIN".equals(user.getRole().getName())
                && !"ADMIN".equals(role.getName())) {
            long activeAdmins = userRepository.countActiveAdmins(businessId);
            if (activeAdmins <= 1) {
                throw new BadRequestException("Cannot remove ADMIN role from the only active administrator");
            }
        }

        user.setRole(role);
        user = userRepository.save(user);

        auditLogService.log(currentUserId, null, businessId, "USER", "USER_ROLE_ASSIGN",
                userId.toString(), "Assigned role " + role.getName() + " to user " + user.getEmail(), null);
        return userMapper.toUserResponse(user, 0);
    }

    private User findUserForBusiness(Long businessId, Long userId) {
        return userRepository.findByIdAndBusinessIdWithRole(userId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
