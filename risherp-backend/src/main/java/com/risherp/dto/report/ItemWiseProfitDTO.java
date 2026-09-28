package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemWiseProfitDTO {
    private Long itemId;
    private String itemCode;
    private String itemName;
    private String categoryName;
    private BigDecimal quantitySold;
    private BigDecimal grossSales;
    private BigDecimal discount;
    private BigDecimal netSales;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private BigDecimal grossProfit;
    private BigDecimal marginPercentage;
}
