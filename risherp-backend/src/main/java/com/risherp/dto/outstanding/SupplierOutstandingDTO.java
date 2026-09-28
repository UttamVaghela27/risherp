package com.risherp.dto.outstanding;

import com.risherp.entity.OpeningBalanceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupplierOutstandingDTO {
    private Long partyId;
    private String partyCode;
    private String partyName;
    private String mobile;
    private String city;
    private BigDecimal openingBalance;
    private OpeningBalanceType openingBalanceType;
    private BigDecimal totalPurchases;
    private BigDecimal totalPayments;
    private BigDecimal totalPurchaseReturns;
    private BigDecimal outstanding;
    private long pendingPurchasesCount;
}
