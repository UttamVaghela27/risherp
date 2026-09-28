package com.risherp.dto.sales;

import lombok.*;

import java.math.BigDecimal;

/**
 * SaleSummaryDTO — aggregated KPI metrics for the Sales dashboard header.
 * Returned by GET /api/sales/summary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleSummaryDTO {

    private long totalInvoices;
    private long paidCount;
    private long partialCount;
    private long pendingCount;
    private BigDecimal totalRevenue;
    private BigDecimal totalSales;
    private BigDecimal totalCollected;
    private BigDecimal totalPaid;
    private BigDecimal totalOutstanding;
    private long todayInvoices;
    private BigDecimal todayRevenue;
}
