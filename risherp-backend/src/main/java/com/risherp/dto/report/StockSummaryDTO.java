package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockSummaryDTO {
    private long totalItems;
    private BigDecimal totalStockQuantity;
    private BigDecimal totalStockValue;
    private long lowStockItems;
    private long outOfStockItems;
}
