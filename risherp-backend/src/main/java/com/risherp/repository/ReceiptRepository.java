package com.risherp.repository;

import com.risherp.entity.Receipt;
import com.risherp.entity.ReceiptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long>, JpaSpecificationExecutor<Receipt> {

    Optional<Receipt> findByIdAndBusinessId(Long id, Long businessId);

    Optional<Receipt> findByReceiptNumberAndBusinessId(String receiptNumber, Long businessId);

    boolean existsByReceiptNumber(String receiptNumber);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndStatus(Long businessId, ReceiptStatus status);

    @Query("SELECT COUNT(r) FROM Receipt r WHERE r.business.id = :businessId AND r.receiptDate = :today")
    long countTodayByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(MAX(r.id), 0) FROM Receipt r")
    Long getMaxId();

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.status = 'COMPLETED'")
    BigDecimal sumTotalAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.receiptDate = :today AND r.status = 'COMPLETED'")
    BigDecimal sumTodayAmountByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.paymentMode = 'CASH' AND r.status = 'COMPLETED'")
    BigDecimal sumCashAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.paymentMode = 'BANK_TRANSFER' AND r.status = 'COMPLETED'")
    BigDecimal sumBankAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.paymentMode = 'UPI' AND r.status = 'COMPLETED'")
    BigDecimal sumUpiAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.paymentMode NOT IN ('CASH', 'BANK_TRANSFER', 'UPI') AND r.status = 'COMPLETED'")
    BigDecimal sumOtherAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(r.allocatedAmount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.status = 'COMPLETED'")
    BigDecimal sumAllocatedAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(r.unallocatedAmount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.status = 'COMPLETED'")
    BigDecimal sumUnallocatedAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Receipt r WHERE r.business.id = :businessId AND r.party.id = :partyId AND r.status = 'COMPLETED'")
    BigDecimal sumTotalAmountByBusinessIdAndPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);
}
