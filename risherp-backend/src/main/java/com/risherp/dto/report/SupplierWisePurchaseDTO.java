package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierWisePurchaseDTO {
    private Long partyId;
    private String supplierName;
    private String phone;
    private long invoiceCount;
    private BigDecimal totalQuantity;
    private BigDecimal grossPurchases;
    private BigDecimal discount;
    private BigDecimal netPurchases;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
}
