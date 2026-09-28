package com.risherp.dto.purchasereturn;

import lombok.*;

import java.math.BigDecimal;

/**
 * PurchaseReturnSummaryDTO — KPI aggregates for Purchase Return dashboard cards.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnSummaryDTO {

    private long totalReturns;
    private long completedReturns;
    private long cancelledReturns;
    private long todayReturns;

    private BigDecimal totalReturnAmount;
    private BigDecimal totalRefundAmount;
    private BigDecimal totalAdjustmentAmount;
}
