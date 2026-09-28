package com.risherp.repository;

import com.risherp.entity.SalesReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface SalesReturnItemRepository extends JpaRepository<SalesReturnItem, Long> {

    /** All return items for a given sales return. */
    List<SalesReturnItem> findBySalesReturnId(Long salesReturnId);

    /**
     * Critical: sum of all quantities returned for a specific SaleItem across ALL completed returns.
     * Used to calculate the remaining returnable quantity.
     * Only counts COMPLETED returns (not cancelled).
     */
    @Query("""
        SELECT COALESCE(SUM(sri.returnQuantity), 0)
        FROM SalesReturnItem sri
        WHERE sri.saleItem.id = :saleItemId
          AND sri.salesReturn.status = 'COMPLETED'
    """)
    BigDecimal sumReturnedQuantityBySaleItemId(@Param("saleItemId") Long saleItemId);

    /**
     * Sum of returned quantities for a specific SaleItem for a specific SalesReturn.
     * Used for validating duplicate inserts in the same return (edge case guard).
     */
    @Query("""
        SELECT COALESCE(SUM(sri.returnQuantity), 0)
        FROM SalesReturnItem sri
        WHERE sri.saleItem.id = :saleItemId
          AND sri.salesReturn.id = :salesReturnId
    """)
    BigDecimal sumReturnedQuantityBySaleItemAndReturn(
            @Param("saleItemId") Long saleItemId,
            @Param("salesReturnId") Long salesReturnId
    );

    /** All return items referencing a specific sale item (for audit/history). */
    List<SalesReturnItem> findBySaleItemId(Long saleItemId);
}
