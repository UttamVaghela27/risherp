package com.risherp.dto.report;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySalesDTO {
    private LocalDate date;
    private long invoiceCount;
    private BigDecimal totalSales;
    private BigDecimal totalDiscount;
    private BigDecimal totalPaid;
    private BigDecimal outstanding;
}
