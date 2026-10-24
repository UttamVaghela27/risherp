package com.risherp.service.impl;

import com.risherp.dto.auth.*;
import com.risherp.entity.OtpPurpose;
import com.risherp.entity.OtpRecord;
import com.risherp.entity.User;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.OtpRecordRepository;
import com.risherp.repository.UserRepository;
import com.risherp.service.EmailService;
import com.risherp.service.OtpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

/**
 * OTP Service Implementation
 *
 * Security properties enforced here:
 *  - OTPs are 6-digit numeric, generated via SecureRandom
 *  - Only BCrypt hash of OTP is persisted
 *  - Raw OTP is never logged or returned in API responses
 *  - Max attempt limit prevents brute-force
 *  - Resend cooldown prevents flooding
 *  - Reset tokens are single-use UUID; consumed on use
 *  - Forgot-password always returns generic message
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpRecordRepository otpRecordRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.otp.resend-cooldown-seconds:60}")
    private int resendCooldownSeconds;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // ── Email Verification ─────────────────────────────────────────────────

    @Override
    @Transactional
    public void sendEmailVerificationOtp(Long userId, String email, String name) {
        // Enforce resend cooldown
        Optional<OtpRecord> latestOpt = otpRecordRepository
                .findLatestActiveByUserIdAndPurpose(userId, OtpPurpose.EMAIL_VERIFICATION);

        if (latestOpt.isPresent()) {
            OtpRecord latest = latestOpt.get();
            long secondsSinceCreation = java.time.Duration.between(latest.getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (secondsSinceCreation < resendCooldownSeconds) {
                long remaining = resendCooldownSeconds - secondsSinceCreation;
                throw new BadRequestException(
                        "Please wait " + remaining + " seconds before requesting a new verification code.");
            }
        }

        // Invalidate existing active OTPs for this user+purpose
        otpRecordRepository.invalidateAllActiveForUserAndPurpose(userId, OtpPurpose.EMAIL_VERIFICATION);

        // Generate and hash a new OTP
        String rawOtp = generateNumericOtp();
        String otpHash = passwordEncoder.encode(rawOtp);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        OtpRecord record = OtpRecord.builder()
                .user(user)
                .purpose(OtpPurpose.EMAIL_VERIFICATION)
                .otpHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .build();
        otpRecordRepository.save(record);

        // Send email — if this throws, the transaction rolls back and no record is saved
        emailService.sendEmailVerificationOtp(email, name, rawOtp);

        log.info("Email verification OTP issued for userId={}", userId);
        // rawOtp deliberately not logged
    }

    @Override
    @Transactional
    public void verifyEmailOtp(VerifyEmailOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getOtp().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid OTP or email address."));

        if (user.isEmailVerified()) {
            // Idempotent — already verified
            return;
        }

        OtpRecord record = otpRecordRepository
                .findLatestActiveByUserIdAndPurpose(user.getId(), OtpPurpose.EMAIL_VERIFICATION)
                .orElseThrow(() -> new BadRequestException("No active verification code found. Please request a new one."));

        if (record.isExpired()) {
            throw new BadRequestException("Your verification code has expired. Please request a new one.");
        }

        if (record.getAttempts() >= maxAttempts) {
            throw new BadRequestException("Maximum verification attempts exceeded. Please request a new code.");
        }

        if (!passwordEncoder.matches(inputOtp, record.getOtpHash())) {
            // Increment attempts atomically within transaction
            record.setAttempts(record.getAttempts() + 1);
            otpRecordRepository.save(record);
            int remaining = maxAttempts - record.getAttempts();
            if (remaining <= 0) {
                throw new BadRequestException("Incorrect code. Maximum attempts reached. Please request a new code.");
            }
            throw new BadRequestException("Incorrect verification code. " + remaining + " attempt(s) remaining.");
        }

        // Mark OTP consumed
        record.setConsumed(true);
        record.setConsumedAt(LocalDateTime.now());
        otpRecordRepository.save(record);

        // Mark user email as verified
        user.setEmailVerified(true);
        userRepository.save(user);

        log.info("Email verified successfully for userId={}", user.getId());
    }

    // ── Forgot / Reset Password ────────────────────────────────────────────

    @Override
    @Transactional
    public void sendPasswordResetOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        // Always log for internal use; never expose account existence externally
        Optional<User> userOpt = userRepository.findByEmail(normalizedEmail);

        if (userOpt.isEmpty()) {
            // Silently return — never reveal that the account doesn't exist
            log.info("Password reset OTP requested for non-existent email (suppressed)");
            return;
        }

        User user = userOpt.get();

        // Only eligible ACTIVE accounts can reset passwords
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            log.warn("Password reset attempted for deactivated account: userId={}", user.getId());
            return; // Silently return — do not reveal status
        }

        // Enforce resend cooldown
        Optional<OtpRecord> latestOpt = otpRecordRepository
                .findLatestActiveByUserIdAndPurpose(user.getId(), OtpPurpose.PASSWORD_RESET);

        if (latestOpt.isPresent()) {
            long secondsSinceCreation = java.time.Duration.between(
                    latestOpt.get().getCreatedAt(), LocalDateTime.now()).getSeconds();
            if (secondsSinceCreation < resendCooldownSeconds) {
                // For forgot-password we silently respect cooldown to prevent timing attacks
                log.info("Password reset resend requested within cooldown for userId={}", user.getId());
                return;
            }
        }

        // Invalidate previous active OTPs for this user+purpose
        otpRecordRepository.invalidateAllActiveForUserAndPurpose(user.getId(), OtpPurpose.PASSWORD_RESET);

        String rawOtp = generateNumericOtp();
        String otpHash = passwordEncoder.encode(rawOtp);

        OtpRecord record = OtpRecord.builder()
                .user(user)
                .purpose(OtpPurpose.PASSWORD_RESET)
                .otpHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .build();
        otpRecordRepository.save(record);

        emailService.sendPasswordResetOtp(user.getEmail(), user.getName(), rawOtp);

        log.info("Password reset OTP issued for userId={}", user.getId());
        // rawOtp deliberately not logged
    }

    @Override
    @Transactional
    public VerifyResetOtpResponse verifyResetOtp(VerifyResetOtpRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String inputOtp = request.getOtp().trim();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid OTP or email address."));

        OtpRecord record = otpRecordRepository
                .findLatestActiveByUserIdAndPurpose(user.getId(), OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new BadRequestException("No active reset code found. Please request a new one."));

        if (record.isExpired()) {
            throw new BadRequestException("Your reset code has expired. Please request a new one.");
        }

        if (record.getAttempts() >= maxAttempts) {
            throw new BadRequestException("Maximum attempts exceeded. Please request a new reset code.");
        }

        if (!passwordEncoder.matches(inputOtp, record.getOtpHash())) {
            record.setAttempts(record.getAttempts() + 1);
            otpRecordRepository.save(record);
            int remaining = maxAttempts - record.getAttempts();
            if (remaining <= 0) {
                throw new BadRequestException("Incorrect code. Maximum attempts reached. Please request a new code.");
            }
            throw new BadRequestException("Incorrect reset code. " + remaining + " attempt(s) remaining.");
        }

        // OTP is valid — issue a single-use reset token (UUID, expires via OTP record expiry)
        String resetToken = UUID.randomUUID().toString();
        record.setResetToken(resetToken);
        // Do NOT mark consumed yet — consumed only after successful password change
        otpRecordRepository.save(record);

        log.info("Password reset OTP verified for userId={}", user.getId());

        return VerifyResetOtpResponse.builder()
                .resetToken(resetToken)
                .email(email)
                .message("OTP verified. You may now set a new password.")
                .build();
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match.");
        }

        String email = request.getEmail().trim().toLowerCase();

        // Lookup the OTP record by reset token
        OtpRecord record = otpRecordRepository.findByResetToken(request.getResetToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset session. Please start over."));

        // Verify the record belongs to the correct user (prevent token swapping)
        if (!record.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new BadRequestException("Invalid reset request.");
        }

        if (record.isConsumed()) {
            throw new BadRequestException("This reset session has already been used. Please request a new one.");
        }

        if (record.isExpired()) {
            throw new BadRequestException("Your reset session has expired. Please request a new reset code.");
        }

        User user = record.getUser();
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Account is not active. Please contact your administrator.");
        }

        // Hash and save new password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Consume the reset token so it cannot be reused
        record.setConsumed(true);
        record.setConsumedAt(LocalDateTime.now());
        otpRecordRepository.save(record);

        log.info("Password successfully reset for userId={}", user.getId());
    }

    // ── Private helpers ────────────────────────────────────────────────────

    /**
     * Generates a cryptographically secure 6-digit numeric OTP.
     * Range: 100000 – 999999 (always 6 digits, no leading zero).
     */
    private String generateNumericOtp() {
        int otp = 100000 + SECURE_RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}
