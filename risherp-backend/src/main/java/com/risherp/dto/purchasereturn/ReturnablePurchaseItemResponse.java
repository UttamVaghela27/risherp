package com.risherp.dto.purchasereturn;

import lombok.*;

import java.math.BigDecimal;

/**
 * ReturnablePurchaseItemResponse — provides pre-calculated returnable quantities
 * for each line item of a Purchase when loading it into the Return creation form.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnablePurchaseItemResponse {

    private Long purchaseItemId;
    private Long itemId;
    private String itemNameSnapshot;
    private String itemCodeSnapshot;
    private String unitSnapshot;

    private BigDecimal originalQuantity;
    private BigDecimal rate;
    private BigDecimal discountAmount;
    private BigDecimal lineTotal;

    /** Sum of quantities already returned across all completed returns. */
    private BigDecimal alreadyReturnedQuantity;

    /** originalQuantity - alreadyReturnedQuantity */
    private BigDecimal returnableQuantity;

    /** True if returnableQuantity == 0. */
    private boolean fullyReturned;
}
