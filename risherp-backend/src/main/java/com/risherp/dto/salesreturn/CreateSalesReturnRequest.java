package com.risherp.dto.salesreturn;

import com.risherp.entity.RefundMode;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * CreateSalesReturnRequest — inbound DTO for creating a sales return.
 * Backend recalculates all financial values; frontend amounts are ignored.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateSalesReturnRequest {

    @NotNull(message = "Original sale ID is required")
    private Long saleId;

    @NotNull(message = "Return date is required")
    private LocalDate returnDate;

    @NotNull(message = "At least one return item is required")
    @Size(min = 1, message = "At least one return item is required")
    @Valid
    private List<SalesReturnItemRequest> items;

    private RefundMode refundMode;    // defaults to CREDIT_ADJUSTMENT if null

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;
}
