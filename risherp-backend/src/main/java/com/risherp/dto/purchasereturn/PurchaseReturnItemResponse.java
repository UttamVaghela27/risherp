package com.risherp.dto.purchasereturn;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PurchaseReturnItemResponse — item details in PurchaseReturn responses.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnItemResponse {

    private Long id;
    private Long purchaseItemId;
    private Long itemId;

    // Snapshots
    private String itemNameSnapshot;
    private String itemCodeSnapshot;
    private String unitSnapshot;

    // Quantities
    private BigDecimal originalQuantity;
    private BigDecimal alreadyReturnedQuantity;
    private BigDecimal returnQuantity;

    // Financials
    private BigDecimal rate;
    private BigDecimal discountAmount;
    private BigDecimal lineTotal;

    private LocalDateTime createdAt;
}
