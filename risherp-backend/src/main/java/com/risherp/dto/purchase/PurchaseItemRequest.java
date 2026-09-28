package com.risherp.dto.purchase;

import com.risherp.entity.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * PurchaseItemRequest — line item for CreatePurchaseRequest.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseItemRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Purchase rate is required")
    @DecimalMin(value = "0.00", message = "Rate cannot be negative")
    private BigDecimal rate;

    /** AMOUNT or PERCENTAGE — defaults to AMOUNT if omitted */
    private DiscountType discountType;

    @Builder.Default
    @DecimalMin(value = "0.00", message = "Discount value cannot be negative")
    private BigDecimal discountValue = BigDecimal.ZERO;
}
