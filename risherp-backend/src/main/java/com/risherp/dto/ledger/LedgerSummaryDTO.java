package com.risherp.dto.ledger;

import com.risherp.entity.OpeningBalanceType;
import com.risherp.entity.PartyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerSummaryDTO {
    private Long partyId;
    private String partyName;
    private String partyCode;
    private PartyType partyType;
    private BigDecimal openingBalance;
    private OpeningBalanceType openingBalanceType;
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private BigDecimal closingBalance;
    private String balanceType; // "Dr" or "Cr"
    private BigDecimal currentOutstanding;
}
