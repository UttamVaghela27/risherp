package com.risherp.dto.purchase;

import com.risherp.entity.DiscountType;
import com.risherp.entity.PaymentMode;
import com.risherp.entity.PurchaseType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * CreatePurchaseRequest — payload for POST /api/purchases.
 * Backend independently recalculates all line and invoice totals.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePurchaseRequest {

    @NotNull(message = "Supplier is required")
    private Long partyId;

    /** Defaults to today if null */
    private LocalDate purchaseDate;

    @NotNull(message = "Purchase type is required")
    private PurchaseType purchaseType;

    @Valid
    @NotEmpty(message = "At least one item is required")
    private List<PurchaseItemRequest> items;

    /** Invoice-level discount type (AMOUNT or PERCENTAGE) */
    private DiscountType overallDiscountType;

    @Builder.Default
    @DecimalMin(value = "0.00", message = "Overall discount cannot be negative")
    private BigDecimal overallDiscount = BigDecimal.ZERO;

    @NotNull(message = "Paid amount is required")
    @DecimalMin(value = "0.00", message = "Paid amount cannot be negative")
    private BigDecimal paidAmount;

    /** Payment mode for paidAmount > 0 */
    private PaymentMode paymentMode;

    private String notes;
}
