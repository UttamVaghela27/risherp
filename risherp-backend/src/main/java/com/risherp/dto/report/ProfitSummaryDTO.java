package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfitSummaryDTO {
    private BigDecimal grossSales;
    private BigDecimal salesDiscount;
    private BigDecimal netSales;
    private BigDecimal costOfGoodsSold;
    private BigDecimal grossProfit;
    private BigDecimal grossMarginPercentage;
    private long totalInvoices;
    private BigDecimal totalQuantitySold;
    private String methodologyNote;
}
