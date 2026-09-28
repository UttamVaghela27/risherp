package com.risherp.dto.sales;

import com.risherp.entity.DiscountType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * SaleItemRequest — one line item in a CreateSaleRequest.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleItemRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Rate is required")
    @DecimalMin(value = "0.00", message = "Rate cannot be negative")
    private BigDecimal rate;

    /** AMOUNT or PERCENTAGE — defaults to AMOUNT if not supplied */
    private DiscountType discountType;

    @Builder.Default
    @DecimalMin(value = "0.00", message = "Discount value cannot be negative")
    private BigDecimal discountValue = BigDecimal.ZERO;
}
