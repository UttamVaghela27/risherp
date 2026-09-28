package com.risherp.dto.salesreturn;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * SalesReturnItemRequest — one line item in a create-return request.
 * saleItemId must reference a SaleItem belonging to the specified sale.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReturnItemRequest {

    @NotNull(message = "Sale item ID is required")
    private Long saleItemId;

    @NotNull(message = "Return quantity is required")
    @DecimalMin(value = "0.001", message = "Return quantity must be greater than zero")
    private BigDecimal returnQuantity;
}
