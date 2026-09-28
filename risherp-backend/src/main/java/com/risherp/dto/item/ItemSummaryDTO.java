package com.risherp.dto.item;

import lombok.*;

import java.math.BigDecimal;

/**
 * ItemSummaryDTO
 * Summary metrics for the item master and inventory foundation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemSummaryDTO {

    private long totalItems;
    private long activeItems;
    private long inactiveItems;
    private long inStockCount;
    private long lowStockCount;
    private long outOfStockCount;
    private BigDecimal totalStockValue;
}
