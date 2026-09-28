package com.risherp.dto.report;

import com.risherp.entity.PaymentStatus;
import com.risherp.entity.PurchaseStatus;
import com.risherp.entity.PurchaseType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReportItemDTO {
    private Long id;
    private String purchaseNumber;
    private String supplierInvoiceNumber;
    private LocalDate purchaseDate;
    private Long partyId;
    private String partyName;
    private PurchaseType purchaseType;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus paymentStatus;
    private PurchaseStatus status;
    private String createdBy;
}
