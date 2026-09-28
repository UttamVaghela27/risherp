package com.risherp.service;

import com.risherp.dto.ledger.LedgerSummaryDTO;
import com.risherp.dto.ledger.PartyLedgerResponse;
import com.risherp.entity.LedgerTransactionType;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface LedgerService {

    PartyLedgerResponse getCustomerLedger(
            Long partyId,
            Long businessId,
            LocalDate dateFrom,
            LocalDate dateTo,
            LedgerTransactionType txnType,
            String search,
            Pageable pageable
    );

    PartyLedgerResponse getSupplierLedger(
            Long partyId,
            Long businessId,
            LocalDate dateFrom,
            LocalDate dateTo,
            LedgerTransactionType txnType,
            String search,
            Pageable pageable
    );

    PartyLedgerResponse getPartyLedger(
            Long partyId,
            Long businessId,
            LocalDate dateFrom,
            LocalDate dateTo,
            LedgerTransactionType txnType,
            String search,
            Pageable pageable
    );

    LedgerSummaryDTO getPartyLedgerSummary(Long partyId, Long businessId);
}
