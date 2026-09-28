package com.risherp.dto.report;

import com.risherp.entity.SalesReturnStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReturnReportItemDTO {
    private Long id;
    private String returnNumber;
    private LocalDate returnDate;
    private String invoiceNumber;
    private Long partyId;
    private String partyName;
    private BigDecimal returnAmount;
    private BigDecimal refundAmount;
    private BigDecimal adjustmentAmount;
    private String reason;
    private SalesReturnStatus status;
    private String createdBy;
}
