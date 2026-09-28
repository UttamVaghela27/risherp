package com.risherp.dto.ledger;

import com.risherp.entity.LedgerTransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntryDTO {
    private Long id;
    private Long partyId;
    private String partyName;
    private LocalDate transactionDate;
    private LedgerTransactionType transactionType;
    private String referenceType;
    private Long referenceId;
    private String referenceNumber;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private BigDecimal runningBalance;
    private String balanceType; // "Dr" or "Cr"
    private String remarks;
    private String createdByName;
    private LocalDateTime createdAt;
}
