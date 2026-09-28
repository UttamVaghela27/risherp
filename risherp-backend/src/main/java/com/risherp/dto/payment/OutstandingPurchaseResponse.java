package com.risherp.dto.payment;

import com.risherp.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * OutstandingPurchaseResponse — represents an unpaid/partially-paid purchase invoice
 * available for payment allocation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutstandingPurchaseResponse {

    private Long purchaseId;
    private String purchaseNumber;
    private LocalDate purchaseDate;
    private BigDecimal grandTotal;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus paymentStatus;
}
