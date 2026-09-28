package com.risherp.entity;

import java.math.BigDecimal;

/**
 * StockStatus Enum
 * Computed runtime status of inventory levels.
 * Not stored permanently in the database as per ERP design rules.
 */
public enum StockStatus {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK;

    /**
     * Compute StockStatus based on current and minimum stock levels.
     * 
     * Rule:
     * - If currentStock <= 0 => OUT_OF_STOCK
     * - Else if currentStock <= minimumStock => LOW_STOCK
     * - Else => IN_STOCK
     */
    public static StockStatus calculate(BigDecimal currentStock, BigDecimal minimumStock) {
        BigDecimal current = currentStock != null ? currentStock : BigDecimal.ZERO;
        BigDecimal minimum = minimumStock != null ? minimumStock : BigDecimal.ZERO;

        if (current.compareTo(BigDecimal.ZERO) <= 0) {
            return OUT_OF_STOCK;
        } else if (current.compareTo(minimum) <= 0) {
            return LOW_STOCK;
        } else {
            return IN_STOCK;
        }
    }
}
