package com.risherp.dto.report;

import com.risherp.entity.PaymentStatus;
import com.risherp.entity.SaleStatus;
import com.risherp.entity.SaleType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReportItemDTO {
    private Long id;
    private String invoiceNumber;
    private LocalDate saleDate;
    private Long partyId;
    private String partyName;
    private SaleType saleType;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus paymentStatus;
    private SaleStatus status;
    private String createdBy;
}
