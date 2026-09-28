package com.risherp.repository;

import com.risherp.entity.PaymentStatus;
import com.risherp.entity.Purchase;
import com.risherp.entity.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long>, JpaSpecificationExecutor<Purchase> {

    Optional<Purchase> findByIdAndBusinessId(Long id, Long businessId);

    Optional<Purchase> findByPurchaseNumberAndBusinessId(String purchaseNumber, Long businessId);

    boolean existsByPurchaseNumber(String purchaseNumber);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndPaymentStatus(Long businessId, PaymentStatus paymentStatus);

    long countByBusinessIdAndStatus(Long businessId, PurchaseStatus status);

    Page<Purchase> findByBusinessIdAndPartyId(Long businessId, Long partyId, Pageable pageable);

    /** Outstanding (unpaid or partially paid) purchases for a supplier */
    @Query("SELECT p FROM Purchase p WHERE p.business.id = :businessId AND p.party.id = :partyId " +
           "AND p.status = 'COMPLETED' AND p.balanceAmount > 0 ORDER BY p.purchaseDate ASC, p.id ASC")
    List<Purchase> findOutstandingPurchasesByPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);

    @Query("SELECT COALESCE(MAX(p.id), 0) FROM Purchase p")
    Long getMaxId();

    @Query("SELECT COALESCE(SUM(p.grandTotal), 0) FROM Purchase p WHERE p.business.id = :businessId AND p.status = 'COMPLETED'")
    BigDecimal sumGrandTotalByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.paidAmount), 0) FROM Purchase p WHERE p.business.id = :businessId AND p.status = 'COMPLETED'")
    BigDecimal sumPaidAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(p.balanceAmount), 0) FROM Purchase p WHERE p.business.id = :businessId AND p.status = 'COMPLETED'")
    BigDecimal sumBalanceAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.business.id = :businessId AND p.purchaseDate = :today AND p.status = 'COMPLETED'")
    long countTodayByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(p.grandTotal), 0) FROM Purchase p WHERE p.business.id = :businessId AND p.purchaseDate = :today AND p.status = 'COMPLETED'")
    BigDecimal sumTodayPurchasesByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    /** Total purchases for a specific party */
    @Query("SELECT COALESCE(SUM(p.grandTotal), 0) FROM Purchase p WHERE p.business.id = :businessId AND p.party.id = :partyId AND p.status = 'COMPLETED'")
    BigDecimal sumGrandTotalByBusinessIdAndPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);

    /** Count of pending/partial purchases for a specific party */
    @Query("SELECT COUNT(p) FROM Purchase p WHERE p.business.id = :businessId AND p.party.id = :partyId AND p.status = 'COMPLETED' AND p.balanceAmount > 0")
    long countOutstandingByPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);
}
