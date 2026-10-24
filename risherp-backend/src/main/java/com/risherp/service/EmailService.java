package com.risherp.service;

/**
 * Email Service
 * Defines contracts for sending OTP emails.
 */
public interface EmailService {

    /**
     * Send an email verification OTP to the given address.
     *
     * @param toEmail recipient email address
     * @param name    recipient display name
     * @param otp     the raw OTP (NEVER persisted; only sent via email)
     * @throws RuntimeException if email delivery fails
     */
    void sendEmailVerificationOtp(String toEmail, String name, String otp);

    /**
     * Send a password-reset OTP to the given address.
     *
     * @param toEmail recipient email address
     * @param name    recipient display name
     * @param otp     the raw OTP
     * @throws RuntimeException if email delivery fails
     */
    void sendPasswordResetOtp(String toEmail, String name, String otp);
}
