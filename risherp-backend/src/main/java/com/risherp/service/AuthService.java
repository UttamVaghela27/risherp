package com.risherp.service;

import com.risherp.dto.auth.*;

public interface AuthService {

    RegisterResponse register(RegisterRequest request, String ipAddress);

    VerifySecurityCodeResponse verifySecurityCode(VerifySecurityCodeRequest request, String ipAddress);

    LoginResponse login(LoginRequest request, String ipAddress);

    UserSummaryDto getCurrentUser(String email);

    void logout(String email, String ipAddress);

    /**
     * Send email verification OTP to the user identified by email.
     * Called after registration and for resend requests.
     */
    void sendEmailVerificationOtp(String email);
}
