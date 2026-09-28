package com.risherp.dto.ledger;

import com.risherp.entity.OpeningBalanceType;
import com.risherp.entity.PartyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartyLedgerResponse {
    private Long partyId;
    private String partyCode;
    private String partyName;
    private String mobile;
    private PartyType partyType;
    private BigDecimal openingBalance;
    private OpeningBalanceType openingBalanceType;

    // Financial totals
    private BigDecimal totalDebit;
    private BigDecimal totalCredit;
    private BigDecimal closingBalance;
    private String closingBalanceType; // "Dr" or "Cr"
    private BigDecimal currentOutstanding;

    // Paginated / filtered ledger transactions with running balance
    private List<LedgerEntryDTO> entries;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}
