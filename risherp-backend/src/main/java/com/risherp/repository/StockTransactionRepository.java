package com.risherp.repository;

import com.risherp.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long>, JpaSpecificationExecutor<StockTransaction> {

    /**
     * Paginated ledger for a specific item within a business.
     * Most recent transactions first.
     */
    @Query("""
        SELECT st FROM StockTransaction st
        WHERE st.business.id = :businessId
          AND st.item.id = :itemId
        ORDER BY st.createdAt DESC
    """)
    Page<StockTransaction> findByBusinessAndItem(
            @Param("businessId") Long businessId,
            @Param("itemId") Long itemId,
            Pageable pageable
    );

    /**
     * Paginated ledger for the entire business (all items).
     * Most recent transactions first.
     */
    @Query("""
        SELECT st FROM StockTransaction st
        WHERE st.business.id = :businessId
        ORDER BY st.createdAt DESC
    """)
    Page<StockTransaction> findByBusiness(
            @Param("businessId") Long businessId,
            Pageable pageable
    );

    /**
     * Paginated ledger with optional itemId and dateRange filters.
     */
    @Query("""
        SELECT st FROM StockTransaction st
        WHERE st.business.id = :businessId
          AND (:itemId IS NULL OR st.item.id = :itemId)
          AND (:fromDate IS NULL OR st.createdAt >= :fromDate)
          AND (:toDate IS NULL OR st.createdAt <= :toDate)
          AND (:referenceType IS NULL OR st.referenceType = :referenceType)
        ORDER BY st.createdAt DESC
    """)
    Page<StockTransaction> findFiltered(
            @Param("businessId") Long businessId,
            @Param("itemId") Long itemId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("referenceType") String referenceType,
            Pageable pageable
    );

    /**
     * Count total transactions for a business.
     */
    long countByBusinessId(Long businessId);
}
