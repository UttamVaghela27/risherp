package com.risherp.dto.purchasereturn;

import com.risherp.entity.RefundMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

/**
 * CreatePurchaseReturnRequest — payload to create a new PurchaseReturn.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePurchaseReturnRequest {

    /** Original Purchase ID. */
    @NotNull(message = "Original purchase ID is required")
    private Long purchaseId;

    /** Date of return (default today if null). */
    private LocalDate returnDate;

    /** Return items to process. */
    @NotEmpty(message = "At least one item must be selected for return")
    @Valid
    private List<PurchaseReturnItemRequest> items;

    /**
     * How the supplier credit is handled:
     * CREDIT_ADJUSTMENT (default — debit note reducing payable),
     * CASH, or BANK.
     */
    @Builder.Default
    private RefundMode refundMode = RefundMode.CREDIT_ADJUSTMENT;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    private String notes;
}
