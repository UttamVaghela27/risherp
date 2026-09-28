
package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.auth.*;
import com.risherp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Manages Business Registration, Security Code Verification, Login, and Session retrieval.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest) {

        String ipAddress = getClientIp(servletRequest);
        RegisterResponse response = authService.register(request, ipAddress);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/verify-login")
    public ResponseEntity<ApiResponse<VerifySecurityCodeResponse>> verifyLogin(
            @Valid @RequestBody VerifySecurityCodeRequest request,
            HttpServletRequest servletRequest) {

        String ipAddress = getClientIp(servletRequest);
        VerifySecurityCodeResponse response = authService.verifySecurityCode(request, ipAddress);

        return ResponseEntity.ok(ApiResponse.success("Security code verified successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest servletRequest) {

        String ipAddress = getClientIp(servletRequest);
        LoginResponse response = authService.login(request, ipAddress);

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserSummaryDto user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Current user profile", user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            Authentication authentication,
            HttpServletRequest servletRequest) {

        if (authentication != null) {
            String ipAddress = getClientIp(servletRequest);
            authService.logout(authentication.getName(), ipAddress);
        }

        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
