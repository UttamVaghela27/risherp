package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesSummaryDTO {
    private long totalInvoices;
    private BigDecimal totalSales;
    private BigDecimal totalDiscount;
    private BigDecimal totalPaid;
    private BigDecimal totalOutstanding;
    private BigDecimal averageInvoiceValue;
}
