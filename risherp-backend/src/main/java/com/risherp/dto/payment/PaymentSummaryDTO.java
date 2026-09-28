package com.risherp.dto.payment;

import lombok.*;

import java.math.BigDecimal;

/**
 * PaymentSummaryDTO — KPI summary for payments.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSummaryDTO {

    private long totalPayments;
    private long todayPayments;
    private long completedPayments;
    private long cancelledPayments;

    private BigDecimal totalAmount;
    private BigDecimal todayAmount;
    private BigDecimal cashAmount;
    private BigDecimal bankAmount;
    private BigDecimal upiAmount;
    private BigDecimal otherAmount;
    private BigDecimal totalAllocatedAmount;
    private BigDecimal totalUnallocatedAmount;
}
