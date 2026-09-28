package com.risherp.repository;

import com.risherp.entity.PurchaseReturnItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PurchaseReturnItemRepository extends JpaRepository<PurchaseReturnItem, Long> {

    List<PurchaseReturnItem> findByPurchaseReturnId(Long purchaseReturnId);

    /**
     * Sums all returnQuantity for a given PurchaseItem where the return is COMPLETED.
     * This ensures cumulative quantities are calculated accurately and safely.
     */
    @Query("SELECT COALESCE(SUM(pri.returnQuantity), 0) FROM PurchaseReturnItem pri " +
           "WHERE pri.purchaseItem.id = :purchaseItemId AND pri.purchaseReturn.status = 'COMPLETED'")
    BigDecimal sumReturnedQuantityByPurchaseItemId(@Param("purchaseItemId") Long purchaseItemId);
}
