package com.risherp.repository;

import com.risherp.entity.PaymentTxn;
import com.risherp.entity.PaymentTxnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface PaymentTxnRepository extends JpaRepository<PaymentTxn, Long>, JpaSpecificationExecutor<PaymentTxn> {

    Optional<PaymentTxn> findByIdAndBusinessId(Long id, Long businessId);

    Optional<PaymentTxn> findByPaymentNumberAndBusinessId(String paymentNumber, Long businessId);

    boolean existsByPaymentNumber(String paymentNumber);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndStatus(Long businessId, PaymentTxnStatus status);

    @Query("SELECT COUNT(p) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.paymentDate = :today")
    long countTodayByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(MAX(p.id), 0) FROM PaymentTxn p")
    Long getMaxId();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.status = 'COMPLETED'")
    BigDecimal sumTotalAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.paymentDate = :today AND p.status = 'COMPLETED'")
    BigDecimal sumTodayAmountByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.paymentMode = 'CASH' AND p.status = 'COMPLETED'")
    BigDecimal sumCashAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.paymentMode = 'BANK_TRANSFER' AND p.status = 'COMPLETED'")
    BigDecimal sumBankAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.paymentMode = 'UPI' AND p.status = 'COMPLETED'")
    BigDecimal sumUpiAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.paymentMode NOT IN ('CASH', 'BANK_TRANSFER', 'UPI') AND p.status = 'COMPLETED'")
    BigDecimal sumOtherAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.allocatedAmount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.status = 'COMPLETED'")
    BigDecimal sumAllocatedAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.unallocatedAmount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.status = 'COMPLETED'")
    BigDecimal sumUnallocatedAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentTxn p WHERE p.business.id = :businessId AND p.party.id = :partyId AND p.status = 'COMPLETED'")
    BigDecimal sumTotalAmountByBusinessIdAndPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);
}
