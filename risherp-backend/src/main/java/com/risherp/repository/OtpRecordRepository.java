package com.risherp.repository;

import com.risherp.entity.OtpPurpose;
import com.risherp.entity.OtpRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for OTP records.
 * Supports fetching the latest valid OTP per user+purpose and cleanup operations.
 */
public interface OtpRecordRepository extends JpaRepository<OtpRecord, Long> {

    /**
     * Find all non-consumed OTP records for a user and purpose,
     * ordered newest first.
     */
    @Query("SELECT o FROM OtpRecord o WHERE o.user.id = :userId AND o.purpose = :purpose AND o.consumed = false ORDER BY o.createdAt DESC")
    List<OtpRecord> findActiveByUserIdAndPurpose(@Param("userId") Long userId, @Param("purpose") OtpPurpose purpose);

    /**
     * Find the most recently created active OTP for a user+purpose.
     */
    default Optional<OtpRecord> findLatestActiveByUserIdAndPurpose(Long userId, OtpPurpose purpose) {
        List<OtpRecord> records = findActiveByUserIdAndPurpose(userId, purpose);
        return records.isEmpty() ? Optional.empty() : Optional.of(records.get(0));
    }

    /**
     * Mark all active OTPs for a user+purpose as consumed (invalidate old OTPs
     * before issuing a new one).
     */
    @Modifying
    @Query("UPDATE OtpRecord o SET o.consumed = true, o.consumedAt = CURRENT_TIMESTAMP " +
           "WHERE o.user.id = :userId AND o.purpose = :purpose AND o.consumed = false")
    void invalidateAllActiveForUserAndPurpose(@Param("userId") Long userId, @Param("purpose") OtpPurpose purpose);

    /**
     * Find OTP record by reset token (for password reset authorization).
     */
    Optional<OtpRecord> findByResetToken(String resetToken);

    /**
     * Delete expired OTP records (maintenance / cleanup).
     */
    @Modifying
    @Query("DELETE FROM OtpRecord o WHERE o.expiresAt < :cutoff")
    void deleteExpiredBefore(@Param("cutoff") LocalDateTime cutoff);
}
