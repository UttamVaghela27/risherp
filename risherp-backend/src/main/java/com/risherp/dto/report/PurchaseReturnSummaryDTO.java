package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnSummaryDTO {
    private long totalReturns;
    private BigDecimal totalReturnAmount;
    private BigDecimal totalRefundAmount;
    private BigDecimal totalAdjustmentAmount;
}
