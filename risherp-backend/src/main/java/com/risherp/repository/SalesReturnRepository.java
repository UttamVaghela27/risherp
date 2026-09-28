package com.risherp.repository;

import com.risherp.entity.SalesReturn;
import com.risherp.entity.SalesReturnStatus;
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
public interface SalesReturnRepository extends JpaRepository<SalesReturn, Long>, JpaSpecificationExecutor<SalesReturn> {

    Optional<SalesReturn> findByIdAndBusinessId(Long id, Long businessId);

    Optional<SalesReturn> findByReturnNumberAndBusinessId(String returnNumber, Long businessId);

    boolean existsByReturnNumber(String returnNumber);

    /** All returns for a specific original sale. */
    List<SalesReturn> findBySaleIdAndBusinessId(Long saleId, Long businessId);

    /** For safe sequential number generation. */
    @Query("SELECT COALESCE(MAX(sr.id), 0) FROM SalesReturn sr")
    Long getMaxId();

    // ---- Aggregates for summary cards ----

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndStatus(Long businessId, SalesReturnStatus status);

    @Query("SELECT COALESCE(SUM(sr.returnAmount), 0) FROM SalesReturn sr WHERE sr.business.id = :businessId AND sr.status = 'COMPLETED'")
    BigDecimal sumReturnAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(sr.refundAmount), 0) FROM SalesReturn sr WHERE sr.business.id = :businessId AND sr.status = 'COMPLETED'")
    BigDecimal sumRefundAmountByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(sr.adjustmentAmount), 0) FROM SalesReturn sr WHERE sr.business.id = :businessId AND sr.status = 'COMPLETED'")
    BigDecimal sumAdjustmentAmountByBusinessId(@Param("businessId") Long businessId);

    /** Today's return count. */
    @Query("SELECT COUNT(sr) FROM SalesReturn sr WHERE sr.business.id = :businessId AND sr.returnDate = :today AND sr.status = 'COMPLETED'")
    long countTodayByBusinessId(@Param("businessId") Long businessId, @Param("today") LocalDate today);

    /** Total refund amount for a specific party */
    @Query("SELECT COALESCE(SUM(sr.refundAmount), 0) FROM SalesReturn sr WHERE sr.business.id = :businessId AND sr.party.id = :partyId AND sr.status = 'COMPLETED'")
    BigDecimal sumRefundAmountByBusinessIdAndPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);
}
