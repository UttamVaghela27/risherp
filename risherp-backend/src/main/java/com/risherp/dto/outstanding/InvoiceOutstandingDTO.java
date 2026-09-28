package com.risherp.dto.outstanding;

import com.risherp.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceOutstandingDTO {
    private Long id;
    private String invoiceNumber;
    private LocalDate invoiceDate;
    private Long partyId;
    private String partyName;
    private BigDecimal grandTotal;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus paymentStatus;
    private String status;
}
