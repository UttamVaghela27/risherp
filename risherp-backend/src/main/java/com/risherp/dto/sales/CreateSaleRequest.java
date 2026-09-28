package com.risherp.dto.sales;

import com.risherp.entity.DiscountType;
import com.risherp.entity.PaymentMode;
import com.risherp.entity.SaleType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * CreateSaleRequest — payload for POST /api/sales.
 *
 * Backend will independently recalculate all totals.
 * Frontend-supplied subtotal/grandTotal values are for informational reference only.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSaleRequest {

    @NotNull(message = "Customer is required")
    private Long partyId;

    /** Defaults to today if null */
    private LocalDate saleDate;

    @NotNull(message = "Sale type is required")
    private SaleType saleType;

    @Valid
    @NotEmpty(message = "At least one item is required")
    private List<SaleItemRequest> items;

    /** Invoice-level discount type (AMOUNT or PERCENTAGE) */
    private DiscountType overallDiscountType;

    @Builder.Default
    @DecimalMin(value = "0.00", message = "Overall discount cannot be negative")
    private BigDecimal overallDiscount = BigDecimal.ZERO;

    @NotNull(message = "Paid amount is required")
    @DecimalMin(value = "0.00", message = "Paid amount cannot be negative")
    private BigDecimal paidAmount;

    /** Required when paidAmount > 0 */
    private PaymentMode paymentMode;

    private String notes;
}
