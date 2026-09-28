package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartyWiseSalesDTO {
    private Long partyId;
    private String partyName;
    private String phone;
    private long invoiceCount;
    private BigDecimal totalQuantity;
    private BigDecimal grossSales;
    private BigDecimal discount;
    private BigDecimal netSales;
    private BigDecimal paidAmount;
    private BigDecimal outstandingAmount;
}
