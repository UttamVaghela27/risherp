package com.risherp.service;

import com.risherp.dto.auth.*;

/**
 * OTP Service
 * Manages the lifecycle of OTPs for email verification and password reset.
 */
public interface OtpService {

    /**
     * Generate a new email verification OTP for the user identified by userId,
     * send it to the given email, and persist only the BCrypt hash.
     * Invalidates any previous active OTPs for the same user+purpose.
     * Enforces resend cooldown.
     */
    void sendEmailVerificationOtp(Long userId, String email, String name);

    /**
     * Verify the email-verification OTP supplied by the user.
     * On success: marks email as verified and consumes the OTP.
     * Enforces max-attempt limit and expiry.
     */
    void verifyEmailOtp(VerifyEmailOtpRequest request);

    /**
     * Initiate forgot-password flow.
     * If an eligible account exists, sends a password-reset OTP.
     * Always returns a generic message — never reveals account existence.
     */
    void sendPasswordResetOtp(String email);

    /**
     * Verify the password-reset OTP.
     * On success: issues a short-lived single-use reset token.
     */
    VerifyResetOtpResponse verifyResetOtp(VerifyResetOtpRequest request);

    /**
     * Reset the user's password using the reset token issued after OTP verification.
     * Reset token is single-use and time-limited.
     */
    void resetPassword(ResetPasswordRequest request);
}
