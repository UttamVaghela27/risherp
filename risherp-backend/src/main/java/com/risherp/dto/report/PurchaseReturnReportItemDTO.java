package com.risherp.dto.report;

import com.risherp.entity.PurchaseReturnStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnReportItemDTO {
    private Long id;
    private String returnNumber;
    private LocalDate returnDate;
    private String purchaseNumber;
    private Long partyId;
    private String partyName;
    private BigDecimal returnAmount;
    private BigDecimal refundAmount;
    private BigDecimal adjustmentAmount;
    private String reason;
    private PurchaseReturnStatus status;
    private String createdBy;
}
