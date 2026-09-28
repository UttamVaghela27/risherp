package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemWiseSalesDTO {
    private Long itemId;
    private String itemName;
    private String itemCode;
    private String categoryName;
    private BigDecimal quantitySold;
    private BigDecimal grossSales;
    private BigDecimal discount;
    private BigDecimal netSales;
    private BigDecimal averageRate;
}
