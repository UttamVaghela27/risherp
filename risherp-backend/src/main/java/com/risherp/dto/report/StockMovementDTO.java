package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockMovementDTO {
    private Long id;
    private LocalDateTime transactionDate;
    private Long itemId;
    private String itemCode;
    private String itemName;
    private String transactionType; // IN / OUT
    private String referenceType; // PURCHASE, SALE, SALES_RETURN, PURCHASE_RETURN, ADJUSTMENT, etc.
    private String referenceNumber;
    private BigDecimal quantity;
    private BigDecimal stockBefore;
    private BigDecimal stockAfter;
    private BigDecimal purchaseRate;
    private BigDecimal stockValue;
    private String createdBy;
}
