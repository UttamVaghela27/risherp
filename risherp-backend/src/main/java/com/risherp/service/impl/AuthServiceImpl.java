package com.risherp.service.impl;

import com.risherp.dto.auth.*;
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
import com.risherp.security.JwtUtil;
import com.risherp.service.AuditLogService;
import com.risherp.service.AuthService;
import com.risherp.service.OtpService;
import com.risherp.util.SecurityCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final AuditLogService auditLogService;
    private final com.risherp.repository.PermissionRepository permissionRepository;
    private final OtpService otpService;

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request, String ipAddress) {
        // 1. Password confirmation check
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        // 2. Uniqueness checks
        if (businessRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A business is already registered with email: " + request.getEmail());
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A user account already exists with email: " + request.getEmail());
        }

        // 3. Generate unique readable Security Code and secure hash
        String rawSecurityCode = SecurityCodeGenerator.generateSecurityCode();
        String securityCodeHash = passwordEncoder.encode(rawSecurityCode);

        // 4. Create Business
        Business business = Business.builder()
                .businessName(request.getBusinessName().trim())
                .ownerName(request.getOwnerName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .mobile(request.getMobile().trim())
                .securityCodeHash(securityCodeHash)
                .isActive(true)
                .build();
        business = businessRepository.save(business);

        // 5. Ensure standard roles exist for this business
        Role adminRole = getOrCreateRoleForBusiness("ADMIN", "System Administrator with full access", business);
        getOrCreateRoleForBusiness("MANAGER", "Store / Branch Manager with operations access", business);
        getOrCreateRoleForBusiness("STAFF", "Billing and standard operations staff", business);

        List<com.risherp.entity.Permission> allPerms = permissionRepository.findAll();
        if (!allPerms.isEmpty() && (adminRole.getPermissions() == null || adminRole.getPermissions().isEmpty())) {
            adminRole.setPermissions(new java.util.HashSet<>(allPerms));
            adminRole = roleRepository.save(adminRole);
        }

        // 6. Create Owner User as ADMIN
        User user = User.builder()
                .business(business)
                .name(request.getOwnerName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .mobile(request.getMobile().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(adminRole)
                .status("ACTIVE")
                .build();
        user = userRepository.save(user);

        // 7. Audit Log
        auditLogService.log(
                user.getId(),
                user.getEmail(),
                business.getId(),
                "AUTH",
                "REGISTER",
                business.getId().toString(),
                "Registered new business: " + business.getBusinessName() + " with owner: " + user.getName(),
                ipAddress
        );

        // 8. Send email verification OTP (non-blocking: email failure should not prevent
        //    the registration response, but the user must verify before logging in)
        try {
            otpService.sendEmailVerificationOtp(user.getId(), user.getEmail(), user.getName());
        } catch (Exception e) {
            log.warn("Email verification OTP could not be sent after registration for userId={}: {}",
                    user.getId(), e.getMessage());
            // Registration succeeds even if email fails; user can request resend
        }

        return RegisterResponse.builder()
                .businessId(business.getId())
                .businessName(business.getBusinessName())
                .ownerName(business.getOwnerName())
                .email(business.getEmail())
                .securityCode(rawSecurityCode)
                .instruction("Save this code securely. It will be required to verify this application.")
                .needsEmailVerification(true)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public VerifySecurityCodeResponse verifySecurityCode(VerifySecurityCodeRequest request, String ipAddress) {
        String inputCode = request.getSecurityCode().trim().toUpperCase();

        // Find matching active business
        List<Business> activeBusinesses = businessRepository.findAll();
        Business matchedBusiness = null;

        for (Business b : activeBusinesses) {
            if (Boolean.TRUE.equals(b.getIsActive()) && passwordEncoder.matches(inputCode, b.getSecurityCodeHash())) {
                matchedBusiness = b;
                break;
            }
        }

        if (matchedBusiness == null) {
            auditLogService.log(
                    null,
                    null,
                    null,
                    "AUTH",
                    "SECURITY_VERIFY_FAILED",
                    null,
                    "Failed security code verification attempt",
                    ipAddress
            );
            throw new BadRequestException("Invalid Security Code. Please check the code provided during registration.");
        }

        String verificationToken = jwtUtil.generateVerificationToken(matchedBusiness.getId(), matchedBusiness.getBusinessName());

        auditLogService.log(
                null,
                matchedBusiness.getEmail(),
                matchedBusiness.getId(),
                "AUTH",
                "SECURITY_VERIFY",
                matchedBusiness.getId().toString(),
                "Successfully verified security code for: " + matchedBusiness.getBusinessName(),
                ipAddress
        );

        return VerifySecurityCodeResponse.builder()
                .verified(true)
                .businessId(matchedBusiness.getId())
                .businessName(matchedBusiness.getBusinessName())
                .ownerName(matchedBusiness.getOwnerName())
                .verificationToken(verificationToken)
                .build();
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request, String ipAddress) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailWithRoleAndBusiness(email)
                .orElseThrow(() -> {
                    auditLogService.log(null, email, null, "AUTH", "LOGIN_FAILED", null, "User not found for email: " + email, ipAddress);
                    return new BadRequestException("Invalid email or password");
                });

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            auditLogService.log(user.getId(), email, user.getBusiness().getId(), "AUTH", "LOGIN_FAILED", null, "Incorrect password for email: " + email, ipAddress);
            throw new BadRequestException("Invalid email or password");
        }

        // Check status
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            auditLogService.log(user.getId(), email, user.getBusiness().getId(), "AUTH", "LOGIN_BLOCKED", null, "Deactivated account attempt for: " + email, ipAddress);
            throw new BadRequestException("Your account is deactivated. Please contact administrator.");
        }

        // Check email verification
        if (!user.isEmailVerified()) {
            auditLogService.log(user.getId(), email, user.getBusiness().getId(), "AUTH", "LOGIN_BLOCKED_UNVERIFIED", null, "Login attempt before email verification for: " + email, ipAddress);
            throw new BadRequestException("Please verify your email address before logging in. Check your inbox for the verification code.");
        }

        // Check business matching if businessId provided
        if (request.getBusinessId() != null && !user.getBusiness().getId().equals(request.getBusinessId())) {
            throw new BadRequestException("This account does not belong to the verified business.");
        }

        // Generate JWT
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getId(),
                user.getBusiness().getId(),
                user.getRole().getName()
        );

        UserSummaryDto userSummary = userMapper.toSummaryDto(user);

        auditLogService.record(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getBusiness().getId(),
                "AUTH",
                "LOGIN_SUCCESS",
                "USER",
                user.getId().toString(),
                user.getEmail(),
                "User logged in successfully: " + user.getEmail(),
                null,
                null,
                ipAddress,
                null
        );

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userSummary)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser(String email) {
        User user = userRepository.findByEmailWithRoleAndBusiness(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return userMapper.toSummaryDto(user);
    }

    @Override
    public void logout(String email, String ipAddress) {
        userRepository.findByEmail(email).ifPresent(user -> {
            auditLogService.log(
                    user.getId(),
                    user.getEmail(),
                    user.getBusiness().getId(),
                    "AUTH",
                    "LOGOUT",
                    user.getId().toString(),
                    "User logged out: " + user.getEmail(),
                    ipAddress
            );
        });
    }

    @Override
    @Transactional
    public void sendEmailVerificationOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("No account found for email: " + normalizedEmail));
        if (user.isEmailVerified()) {
            throw new BadRequestException("This email address is already verified.");
        }
        otpService.sendEmailVerificationOtp(user.getId(), user.getEmail(), user.getName());
    }

    private Role getOrCreateRole(String roleName, String description) {
        return roleRepository.findFirstByName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name(roleName)
                        .description(description)
                        .status("ACTIVE")
                        .build()));
    }

    private Role getOrCreateRoleForBusiness(String roleName, String description, Business business) {
        return roleRepository.findFirstByNameAndBusinessId(roleName, business.getId())
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .business(business)
                        .name(roleName)
                        .description(description)
                        .status("ACTIVE")
                        .build()));
    }
}
