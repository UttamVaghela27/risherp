package com.risherp.repository;

import com.risherp.entity.PurchaseReturn;
import com.risherp.entity.PurchaseReturnStatus;
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
public interface PurchaseReturnRepository extends JpaRepository<PurchaseReturn, Long>, JpaSpecificationExecutor<PurchaseReturn> {

    Optional<PurchaseReturn> findByIdAndBusinessId(Long id, Long businessId);

    Optional<PurchaseReturn> findByReturnNumberAndBusinessId(String returnNumber, Long businessId);

    boolean existsByReturnNumber(String returnNumber);

    List<PurchaseReturn> findByPurchaseIdAndBusinessId(Long purchaseId, Long businessId);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndStatus(Long businessId, PurchaseReturnStatus status);

    @Query("SELECT COUNT(pr) FROM PurchaseReturn pr WHERE pr.business.id = :businessId AND pr.returnDate = :today")
    long countTodayByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    @Query("SELECT COALESCE(MAX(pr.id), 0) FROM PurchaseReturn pr")
    Long getMaxId();

    @Query("SELECT COALESCE(SUM(pr.returnAmount), 0) FROM PurchaseReturn pr WHERE pr.business.id = :businessId AND pr.status = 'COMPLETED'")
    BigDecimal sumReturnAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(pr.refundAmount), 0) FROM PurchaseReturn pr WHERE pr.business.id = :businessId AND pr.status = 'COMPLETED'")
    BigDecimal sumRefundAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(pr.adjustmentAmount), 0) FROM PurchaseReturn pr WHERE pr.business.id = :businessId AND pr.status = 'COMPLETED'")
    BigDecimal sumAdjustmentAmountByBusinessId(@Param("businessId") Long businessId);

    /** Total refund amount for a specific supplier */
    @Query("SELECT COALESCE(SUM(pr.refundAmount), 0) FROM PurchaseReturn pr WHERE pr.business.id = :businessId AND pr.party.id = :partyId AND pr.status = 'COMPLETED'")
    BigDecimal sumRefundAmountByBusinessIdAndPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);
}
