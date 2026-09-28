package com.risherp.repository;

import com.risherp.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * SaleItemRepository
 * Data access layer for SaleItem entity.
 */
@Repository
public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    List<SaleItem> findBySaleIdOrderByIdAsc(Long saleId);

    long countBySaleId(Long saleId);

    /** Validates that a SaleItem belongs to a specific Sale — used by SalesReturnService. */
    Optional<SaleItem> findByIdAndSaleId(Long id, Long saleId);
}
