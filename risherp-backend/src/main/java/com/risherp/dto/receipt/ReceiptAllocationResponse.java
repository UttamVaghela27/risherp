package com.risherp.dto.receipt;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ReceiptAllocationResponse — details of an invoice allocation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptAllocationResponse {

    private Long id;
    private Long saleId;
    private String invoiceNumber;
    private LocalDate saleDate;
    private BigDecimal invoiceGrandTotal;
    private BigDecimal allocatedAmount;
    private LocalDateTime createdAt;
}
