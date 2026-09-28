package com.risherp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OutstandingDTO {

    private Long partyId;
    private String partyName;
    private String partyType; // "CUSTOMER", "SUPPLIER"
    private BigDecimal amount;
    private Integer overdueDays;
}
