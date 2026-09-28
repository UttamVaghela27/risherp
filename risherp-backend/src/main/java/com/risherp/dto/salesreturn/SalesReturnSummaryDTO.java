package com.risherp.dto.salesreturn;

import lombok.*;

import java.math.BigDecimal;

/**
 * SalesReturnSummaryDTO — KPI summary for the Sales Return History dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReturnSummaryDTO {

    private long totalReturns;
    private long completedReturns;
    private long cancelledReturns;
    private long todayReturns;

    private BigDecimal totalReturnAmount;
    private BigDecimal totalRefundAmount;
    private BigDecimal totalAdjustmentAmount;
}
