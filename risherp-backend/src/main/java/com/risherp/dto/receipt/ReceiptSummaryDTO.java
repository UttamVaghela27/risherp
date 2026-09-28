package com.risherp.dto.receipt;

import lombok.*;

import java.math.BigDecimal;

/**
 * ReceiptSummaryDTO — KPI summary for receipts.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptSummaryDTO {

    private long totalReceipts;
    private long todayReceipts;
    private long completedReceipts;
    private long cancelledReceipts;

    private BigDecimal totalAmount;
    private BigDecimal todayAmount;
    private BigDecimal cashAmount;
    private BigDecimal bankAmount;
    private BigDecimal upiAmount;
    private BigDecimal otherAmount;
    private BigDecimal totalAllocatedAmount;
    private BigDecimal totalUnallocatedAmount;
}
