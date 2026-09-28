package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemWisePurchaseDTO {
    private Long itemId;
    private String itemName;
    private String itemCode;
    private String categoryName;
    private BigDecimal quantityPurchased;
    private BigDecimal grossPurchases;
    private BigDecimal discount;
    private BigDecimal netPurchases;
    private BigDecimal averageRate;
}
