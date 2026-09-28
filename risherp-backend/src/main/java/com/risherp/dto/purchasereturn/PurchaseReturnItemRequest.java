package com.risherp.dto.purchasereturn;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * PurchaseReturnItemRequest — item payload within CreatePurchaseReturnRequest.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnItemRequest {

    /** Original PurchaseItem ID. */
    @NotNull(message = "Purchase item ID is required")
    private Long purchaseItemId;

    /** Quantity to return (must be > 0 and <= returnableQuantity). */
    @NotNull(message = "Return quantity is required")
    @DecimalMin(value = "0.001", message = "Return quantity must be greater than zero")
    private BigDecimal returnQuantity;
}
