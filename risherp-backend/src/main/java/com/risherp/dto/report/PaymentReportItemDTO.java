package com.risherp.dto.report;

import com.risherp.entity.PaymentMode;
import com.risherp.entity.PaymentTxnStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentReportItemDTO {
    private Long id;
    private String paymentNumber;
    private LocalDate paymentDate;
    private Long partyId;
    private String partyName;
    private BigDecimal amount;
    private PaymentMode paymentMode;
    private String referenceNumber;
    private BigDecimal allocatedAmount;
    private BigDecimal unallocatedAmount;
    private PaymentTxnStatus status;
    private String createdBy;
}
