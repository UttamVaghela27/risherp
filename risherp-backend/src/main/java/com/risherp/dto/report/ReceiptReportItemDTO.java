package com.risherp.dto.report;

import com.risherp.entity.PaymentMode;
import com.risherp.entity.ReceiptStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptReportItemDTO {
    private Long id;
    private String receiptNumber;
    private LocalDate receiptDate;
    private Long partyId;
    private String partyName;
    private BigDecimal amount;
    private PaymentMode paymentMode;
    private String referenceNumber;
    private BigDecimal allocatedAmount;
    private BigDecimal unallocatedAmount;
    private ReceiptStatus status;
    private String createdBy;
}
