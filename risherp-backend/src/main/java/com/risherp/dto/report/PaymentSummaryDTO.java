package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentSummaryDTO {
    private long totalPayments;
    private BigDecimal totalAmount;
    private BigDecimal cashAmount;
    private BigDecimal bankAmount;
    private BigDecimal upiAmount;
    private BigDecimal chequeAmount;
    private BigDecimal cardAmount;
    private BigDecimal otherAmount;
    private BigDecimal allocatedAmount;
    private BigDecimal unallocatedAmount;
}
