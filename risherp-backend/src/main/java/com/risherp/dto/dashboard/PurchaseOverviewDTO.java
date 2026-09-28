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
public class PurchaseOverviewDTO {

    private String date;
    private String label; // e.g. "Mon", "01 Sep"
    private BigDecimal amount;
    private Long count;
}
