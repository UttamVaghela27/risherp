
package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.auth.*;
import com.risherp.service.AuthService;
import com.risherp.service.OtpService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication Controller
 * Manages Business Registration, Security Code Verification, Login, Session retrieval,
 * Email OTP Verification, and Forgot/Reset Password.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest) {

        String ipAddress = getClientIp(servletRequest);
        RegisterResponse response = authService.register(request, ipAddress);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful. Please verify your email.", response));
    }

    // ── Email Verification ─────────────────────────────────────────────────

    /**
     * Send (or re-send) an email verification OTP.
     * Called automatically after registration and on demand (resend button).
     * POST /api/auth/send-verification-otp
     */
    @PostMapping("/send-verification-otp")
    public ResponseEntity<ApiResponse<Void>> sendVerificationOtp(
            @Valid @RequestBody SendVerificationOtpRequest request) {

        authService.sendEmailVerificationOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "Verification code sent. Please check your email.", null));
    }

    /**
     * Verify email OTP entered by the user.
     * POST /api/auth/verify-email-otp
     */
    @PostMapping("/verify-email-otp")
    public ResponseEntity<ApiResponse<Void>> verifyEmailOtp(
            @Valid @RequestBody VerifyEmailOtpRequest request) {

        otpService.verifyEmailOtp(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Email verified successfully. You may now log in.", null));
    }

    /**
     * Resend email verification OTP (alias for send-verification-otp, kept for frontend clarity).
     * POST /api/auth/resend-verification-otp
     */
    @PostMapping("/resend-verification-otp")
    public ResponseEntity<ApiResponse<Void>> resendVerificationOtp(
            @Valid @RequestBody SendVerificationOtpRequest request) {

        authService.sendEmailVerificationOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "A new verification code has been sent to your email.", null));
    }

    // ── Forgot / Reset Password ────────────────────────────────────────────

    /**
     * Initiate forgot-password flow.
     * Always returns a generic message to prevent account enumeration.
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        otpService.sendPasswordResetOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "If an eligible account exists for this email, password reset instructions will be sent.", null));
    }

    /**
     * Verify the password-reset OTP and receive a single-use reset token.
     * POST /api/auth/verify-reset-otp
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<VerifyResetOtpResponse>> verifyResetOtp(
            @Valid @RequestBody VerifyResetOtpRequest request) {

        VerifyResetOtpResponse response = otpService.verifyResetOtp(request);
        return ResponseEntity.ok(ApiResponse.success("OTP verified.", response));
    }

    /**
     * Reset the user's password using the reset token.
     * POST /api/auth/reset-password
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        otpService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(
                "Password reset successfully. You may now log in with your new password.", null));
    }

    // ── Existing endpoints (unchanged) ─────────────────────────────────────

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
