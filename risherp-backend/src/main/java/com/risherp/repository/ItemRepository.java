package com.risherp.repository;

import com.risherp.entity.Item;
import com.risherp.entity.ItemStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * ItemRepository
 * Data access layer for Item entity supporting multi-criteria search, barcode lookup,
 * category dependency checks, and inventory aggregations.
 */
@Repository
public interface ItemRepository extends JpaRepository<Item, Long>, JpaSpecificationExecutor<Item> {

    Optional<Item> findByIdAndBusinessId(Long id, Long businessId);

    /**
     * Pessimistic write lock — used during sale creation to prevent concurrent over-selling.
     * Acquires a row-level exclusive lock on the Item row for the duration of the @Transactional block.
     * Two concurrent sales will serialize at this point; the second will see the updated stock.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Item i WHERE i.id = :id AND i.business.id = :businessId")
    Optional<Item> findByIdAndBusinessIdWithLock(@Param("id") Long id, @Param("businessId") Long businessId);

    boolean existsByBusinessIdAndItemCode(Long businessId, String itemCode);

    boolean existsByBusinessIdAndBarcode(Long businessId, String barcode);

    boolean existsByBusinessIdAndBarcodeAndIdNot(Long businessId, String barcode, Long id);

    Optional<Item> findByBusinessIdAndBarcode(Long businessId, String barcode);

    Optional<Item> findByBusinessIdAndItemCode(Long businessId, String itemCode);

    long countByBusinessIdAndCategoryIdAndStatus(Long businessId, Long categoryId, ItemStatus status);

    long countByBusinessIdAndCategoryId(Long businessId, Long categoryId);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndStatus(Long businessId, ItemStatus status);

    @Query("SELECT COALESCE(MAX(i.id), 0) FROM Item i")
    Long getMaxId();

    @Query("SELECT COALESCE(SUM(i.currentStock * i.purchaseRate), 0) FROM Item i WHERE i.business.id = :businessId")
    BigDecimal sumStockValueByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.business.id = :businessId AND i.currentStock <= 0")
    long countOutOfStock(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.business.id = :businessId AND i.currentStock > 0 AND i.currentStock <= i.minimumStock")
    long countLowStock(@Param("businessId") Long businessId);

    @Query("SELECT COUNT(i) FROM Item i WHERE i.business.id = :businessId AND i.currentStock > i.minimumStock")
    long countInStock(@Param("businessId") Long businessId);

    @Query("SELECT i FROM Item i WHERE i.business.id = :businessId AND i.currentStock <= i.minimumStock ORDER BY i.currentStock ASC")
    List<Item> findLowStockItems(@Param("businessId") Long businessId);
}
