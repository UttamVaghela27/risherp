package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * OTP Record Entity
 * Stores hashed OTPs for:
 *   - EMAIL_VERIFICATION: verifying user email after registration
 *   - PASSWORD_RESET: authorising a password change after forgot-password flow
 *
 * OTPs are NEVER stored in plain text.
 * Each record tracks attempts and consumed state to prevent brute-force and replay attacks.
 */
@Entity
@Table(name = "otp_records", indexes = {
    @Index(name = "idx_otp_user_purpose", columnList = "user_id, purpose"),
    @Index(name = "idx_otp_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user this OTP belongs to.
     * Guaranteed to never belong to a different user.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The purpose of this OTP.
     * EMAIL_VERIFICATION or PASSWORD_RESET.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OtpPurpose purpose;

    /**
     * BCrypt hash of the actual OTP.
     * The raw OTP is NEVER stored.
     */
    @Column(name = "otp_hash", nullable = false, length = 255)
    private String otpHash;

    /**
     * After successful PASSWORD_RESET OTP verification, a short-lived single-use
     * UUID reset token is stored here (plain UUID, not sensitive enough to hash
     * but single-use and short-lived).
     * Null for EMAIL_VERIFICATION or before OTP verification for PASSWORD_RESET.
     */
    @Column(name = "reset_token", length = 100)
    private String resetToken;

    /**
     * Absolute expiry timestamp for the OTP.
     */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /**
     * Number of failed verification attempts.
     * Used to enforce max-attempt limits.
     */
    @Builder.Default
    @Column(nullable = false)
    private int attempts = 0;

    /**
     * Whether this OTP has been consumed (verified successfully).
     * Prevents replay attacks.
     */
    @Builder.Default
    @Column(nullable = false)
    private boolean consumed = false;

    /**
     * Timestamp when this record was created.
     * Used for resend cooldown enforcement.
     */
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when this OTP was successfully consumed.
     */
    @Column(name = "consumed_at")
    private LocalDateTime consumedAt;

    // ── Convenience helpers ────────────────────────────────────────────────

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !consumed && !isExpired();
    }
}
