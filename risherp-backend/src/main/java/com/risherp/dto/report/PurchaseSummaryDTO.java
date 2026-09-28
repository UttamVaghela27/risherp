package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseSummaryDTO {
    private long totalPurchases;
    private BigDecimal totalAmount;
    private BigDecimal totalDiscount;
    private BigDecimal totalPaid;
    private BigDecimal totalPayable;
    private BigDecimal averagePurchaseValue;
}
