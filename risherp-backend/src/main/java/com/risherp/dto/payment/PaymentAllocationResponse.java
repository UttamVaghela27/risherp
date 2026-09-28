package com.risherp.dto.payment;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PaymentAllocationResponse — details of a purchase allocation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAllocationResponse {

    private Long id;
    private Long purchaseId;
    private String purchaseNumber;
    private LocalDate purchaseDate;
    private BigDecimal purchaseGrandTotal;
    private BigDecimal allocatedAmount;
    private LocalDateTime createdAt;
}
