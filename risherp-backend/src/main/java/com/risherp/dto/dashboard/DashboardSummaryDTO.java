package com.risherp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for the 8 core operational & financial dashboard summary cards.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    // Operational KPIs
    private BigDecimal todaySales;
    private BigDecimal todayPurchase;
    private BigDecimal todayReceipts;
    private BigDecimal todayPayments;

    // Financial Position & Inventory
    private BigDecimal totalReceivable;
    private BigDecimal totalPayable;
    private BigDecimal stockValue;
    private Long lowStockCount;

    // Growth trends (vs previous period)
    private Double salesGrowth;
    private Double purchaseGrowth;
    private Double receiptsGrowth;
    private Double paymentsGrowth;
}
