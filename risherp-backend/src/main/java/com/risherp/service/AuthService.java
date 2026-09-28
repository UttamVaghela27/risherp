package com.risherp.service;

import com.risherp.dto.auth.*;

public interface AuthService {

    RegisterResponse register(RegisterRequest request, String ipAddress);

    VerifySecurityCodeResponse verifySecurityCode(VerifySecurityCodeRequest request, String ipAddress);

    LoginResponse login(LoginRequest request, String ipAddress);

    UserSummaryDto getCurrentUser(String email);

    void logout(String email, String ipAddress);
}
