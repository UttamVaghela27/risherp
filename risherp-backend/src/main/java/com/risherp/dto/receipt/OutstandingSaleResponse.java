package com.risherp.dto.receipt;

import com.risherp.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * OutstandingSaleResponse — represents an unpaid/partially-paid sales invoice
 * available for receipt allocation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutstandingSaleResponse {

    private Long saleId;
    private String invoiceNumber;
    private LocalDate saleDate;
    private BigDecimal grandTotal;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus paymentStatus;
}
