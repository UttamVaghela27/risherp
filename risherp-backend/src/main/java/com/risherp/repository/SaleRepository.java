package com.risherp.repository;

import com.risherp.entity.PaymentStatus;
import com.risherp.entity.Sale;
import com.risherp.entity.SaleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * SaleRepository
 * Data access layer for Sale entity.
 * JpaSpecificationExecutor enables dynamic multi-criteria filtering for sales history.
 */
@Repository
public interface SaleRepository extends JpaRepository<Sale, Long>, JpaSpecificationExecutor<Sale> {

    Optional<Sale> findByIdAndBusinessId(Long id, Long businessId);

    Optional<Sale> findByInvoiceNumberAndBusinessId(String invoiceNumber, Long businessId);

    boolean existsByInvoiceNumber(String invoiceNumber);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndPaymentStatus(Long businessId, PaymentStatus paymentStatus);

    long countByBusinessIdAndStatus(Long businessId, SaleStatus status);

    /** Total invoices for a customer */
    long countByBusinessIdAndPartyId(Long businessId, Long partyId);

    /** Outstanding (unpaid or partially paid) sales for a party */
    @Query("SELECT s FROM Sale s WHERE s.business.id = :businessId AND s.party.id = :partyId " +
           "AND s.status = 'COMPLETED' AND s.balanceAmount > 0 ORDER BY s.saleDate ASC, s.id ASC")
    List<Sale> findOutstandingSalesByPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);

    /** Max ID to help generate unique invoice numbers */
    @Query("SELECT COALESCE(MAX(s.id), 0) FROM Sale s")
    Long getMaxId();

    /** Total revenue (grand total) across all completed sales */
    @Query("SELECT COALESCE(SUM(s.grandTotal), 0) FROM Sale s WHERE s.business.id = :businessId AND s.status = 'COMPLETED'")
    BigDecimal sumGrandTotalByBusinessId(@Param("businessId") Long businessId);

    /** Total collected (paid amount) across all completed sales */
    @Query("SELECT COALESCE(SUM(s.paidAmount), 0) FROM Sale s WHERE s.business.id = :businessId AND s.status = 'COMPLETED'")
    BigDecimal sumPaidAmountByBusinessId(@Param("businessId") Long businessId);

    /** Total outstanding (balance) across all completed sales */
    @Query("SELECT COALESCE(SUM(s.balanceAmount), 0) FROM Sale s WHERE s.business.id = :businessId AND s.status = 'COMPLETED'")
    BigDecimal sumBalanceAmountByBusinessId(@Param("businessId") Long businessId);

    /** Today's invoice count */
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.business.id = :businessId AND s.saleDate = :today AND s.status = 'COMPLETED'")
    long countTodayByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    /** Today's revenue */
    @Query("SELECT COALESCE(SUM(s.grandTotal), 0) FROM Sale s WHERE s.business.id = :businessId AND s.saleDate = :today AND s.status = 'COMPLETED'")
    BigDecimal sumTodayRevenueByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    /** Total sales for a specific party */
    @Query("SELECT COALESCE(SUM(s.grandTotal), 0) FROM Sale s WHERE s.business.id = :businessId AND s.party.id = :partyId AND s.status = 'COMPLETED'")
    BigDecimal sumGrandTotalByBusinessIdAndPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);

    /** Count of pending/partial sales for a specific party */
    @Query("SELECT COUNT(s) FROM Sale s WHERE s.business.id = :businessId AND s.party.id = :partyId AND s.status = 'COMPLETED' AND s.balanceAmount > 0")
    long countOutstandingByPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);
}
