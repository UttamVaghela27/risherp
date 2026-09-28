package com.risherp.dto.outstanding;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutstandingSummaryDTO {
    private BigDecimal totalReceivable;
    private BigDecimal totalPayable;
    private long customerCount;
    private long supplierCount;
    private long customersWithOutstandingCount;
    private long suppliersWithOutstandingCount;
}
