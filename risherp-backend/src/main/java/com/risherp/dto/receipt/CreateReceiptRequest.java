package com.risherp.dto.receipt;

import com.risherp.entity.PaymentMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * CreateReceiptRequest — payload to create a customer receipt.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReceiptRequest {

    @NotNull(message = "Customer ID is required")
    private Long partyId;

    private LocalDate receiptDate;

    @NotNull(message = "Receipt amount is required")
    @DecimalMin(value = "0.01", message = "Receipt amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment mode is required")
    private PaymentMode paymentMode;

    @Size(max = 100, message = "Reference number cannot exceed 100 characters")
    private String referenceNumber;

    @Valid
    private List<ReceiptAllocationRequest> allocations;

    private String notes;
}
