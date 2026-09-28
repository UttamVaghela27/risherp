package com.risherp.dto.party;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * PartySummaryDTO
 * Aggregated statistics for party management screens and dashboard integration.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartySummaryDTO {
    private long totalParties;
    private long totalCustomers;
    private long totalSuppliers;
    private long totalBoth;
    private long activeParties;
    private long inactiveParties;
    private BigDecimal totalReceivables;
    private BigDecimal totalPayables;
}
