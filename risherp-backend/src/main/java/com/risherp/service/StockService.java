package com.risherp.service;

import com.risherp.dto.stock.StockTransactionResponse;
import com.risherp.entity.Item;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * StockService
 * Centralized service for all inventory adjustments.
 *
 * Rules:
 *  1. All methods require an existing outer @Transactional context (Propagation.MANDATORY).
 *  2. Item row is locked with PESSIMISTIC_WRITE before every modification.
 *  3. Every movement is recorded in the stock_transactions ledger table.
 *  4. Negative stock is strictly disallowed for OUT operations.
 *  5. BigDecimal is used for all quantities — no float/double.
 */
public interface StockService {

    /**
     * Atomically increases stock of an item (e.g. on Purchase, Sales Cancel).
     * Records a StockTransaction with type=IN.
     *
     * @param businessId    business ID for tenancy
     * @param itemId        target item ID
     * @param quantity      amount to add (must be > 0)
     * @param referenceType e.g., "PURCHASE", "SALE_CANCEL"
     * @param referenceNumber e.g., "PUR-000001", "INV-000001"
     * @return updated Item
     */
    Item increaseStock(Long businessId, Long itemId, BigDecimal quantity,
                       String referenceType, String referenceNumber);

    /**
     * Atomically decreases stock of an item (e.g. on Sale, Purchase Cancel).
     * Records a StockTransaction with type=OUT.
     * Rejects the operation if resulting stock would go negative.
     *
     * @param businessId    business ID for tenancy
     * @param itemId        target item ID
     * @param quantity      amount to subtract (must be > 0)
     * @param referenceType e.g., "SALE", "PURCHASE_CANCEL"
     * @param referenceNumber e.g., "INV-000001", "PUR-000001"
     * @return updated Item
     */
    Item decreaseStock(Long businessId, Long itemId, BigDecimal quantity,
                       String referenceType, String referenceNumber);

    /**
     * Paginated stock transaction ledger with optional filters.
     *
     * @param businessId    mandatory tenant filter
     * @param itemId        optional — filter by specific item (null = all items)
     * @param fromDate      optional — filter from date (inclusive)
     * @param toDate        optional — filter to date (inclusive, end of day)
     * @param referenceType optional — filter by source module (SALE, PURCHASE, etc.)
     * @param page          0-based page index
     * @param size          page size
     * @return paginated list of StockTransactionResponse
     */
    Page<StockTransactionResponse> getStockLedger(
            Long businessId,
            Long itemId,
            LocalDate fromDate,
            LocalDate toDate,
            String referenceType,
            int page,
            int size
    );
}
