package com.risherp.service.impl;

import com.risherp.dto.ledger.LedgerEntryDTO;
import com.risherp.dto.ledger.LedgerSummaryDTO;
import com.risherp.dto.ledger.PartyLedgerResponse;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.LedgerEntryRepository;
import com.risherp.repository.PartyRepository;
import com.risherp.service.LedgerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LedgerServiceImpl implements LedgerService {

    private final LedgerEntryRepository ledgerEntryRepository;
    private final PartyRepository partyRepository;

    @Override
    @Transactional(readOnly = true)
    public PartyLedgerResponse getCustomerLedger(
            Long partyId,
            Long businessId,
            LocalDate dateFrom,
            LocalDate dateTo,
            LedgerTransactionType txnType,
            String search,
            Pageable pageable
    ) {
        Party party = getPartyAndValidate(partyId, businessId);
        if (party.getPartyType() == PartyType.SUPPLIER) {
            throw new BadRequestException("Party " + party.getPartyName() + " is configured as a Supplier, not Customer.");
        }
        return buildLedgerResponse(party, businessId, dateFrom, dateTo, txnType, search, pageable, true);
    }

    @Override
    @Transactional(readOnly = true)
    public PartyLedgerResponse getSupplierLedger(
            Long partyId,
            Long businessId,
            LocalDate dateFrom,
            LocalDate dateTo,
            LedgerTransactionType txnType,
            String search,
            Pageable pageable
    ) {
        Party party = getPartyAndValidate(partyId, businessId);
        if (party.getPartyType() == PartyType.CUSTOMER) {
            throw new BadRequestException("Party " + party.getPartyName() + " is configured as a Customer, not Supplier.");
        }
        return buildLedgerResponse(party, businessId, dateFrom, dateTo, txnType, search, pageable, false);
    }

    @Override
    @Transactional(readOnly = true)
    public PartyLedgerResponse getPartyLedger(
            Long partyId,
            Long businessId,
            LocalDate dateFrom,
            LocalDate dateTo,
            LedgerTransactionType txnType,
            String search,
            Pageable pageable
    ) {
        Party party = getPartyAndValidate(partyId, businessId);
        boolean isCustomerPerspective = (party.getPartyType() != PartyType.SUPPLIER);
        return buildLedgerResponse(party, businessId, dateFrom, dateTo, txnType, search, pageable, isCustomerPerspective);
    }

    @Override
    @Transactional(readOnly = true)
    public LedgerSummaryDTO getPartyLedgerSummary(Long partyId, Long businessId) {
        Party party = getPartyAndValidate(partyId, businessId);
        BigDecimal totalDebit = ledgerEntryRepository.sumDebitByPartyId(businessId, partyId);
        BigDecimal totalCredit = ledgerEntryRepository.sumCreditByPartyId(businessId, partyId);
        if (totalDebit == null) totalDebit = BigDecimal.ZERO;
        if (totalCredit == null) totalCredit = BigDecimal.ZERO;

        BigDecimal balanceDiff = totalDebit.subtract(totalCredit);
        String balanceType = balanceDiff.compareTo(BigDecimal.ZERO) >= 0 ? "Dr" : "Cr";
        BigDecimal closingBalance = balanceDiff.abs();

        BigDecimal currentOutstanding;
        if (party.getPartyType() == PartyType.SUPPLIER) {
            currentOutstanding = totalCredit.subtract(totalDebit);
        } else {
            currentOutstanding = totalDebit.subtract(totalCredit);
        }

        return LedgerSummaryDTO.builder()
                .partyId(party.getId())
                .partyCode(party.getPartyCode())
                .partyName(party.getPartyName())
                .partyType(party.getPartyType())
                .openingBalance(party.getOpeningBalance())
                .openingBalanceType(party.getOpeningBalanceType())
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .closingBalance(closingBalance)
                .balanceType(balanceType)
                .currentOutstanding(currentOutstanding)
                .build();
    }

    private PartyLedgerResponse buildLedgerResponse(
            Party party,
            Long businessId,
            LocalDate dateFrom,
            LocalDate dateTo,
            LedgerTransactionType txnType,
            String search,
            Pageable pageable,
            boolean isCustomerPerspective
    ) {
        // Fetch all matching entries ordered by transactionDate ASC, id ASC
        List<LedgerEntry> allMatching = ledgerEntryRepository.findFilteredEntries(
                businessId, party.getId(), dateFrom, dateTo, txnType, search
        );

        // Fetch totals for whole party
        BigDecimal totalDebit = ledgerEntryRepository.sumDebitByPartyId(businessId, party.getId());
        BigDecimal totalCredit = ledgerEntryRepository.sumCreditByPartyId(businessId, party.getId());
        if (totalDebit == null) totalDebit = BigDecimal.ZERO;
        if (totalCredit == null) totalCredit = BigDecimal.ZERO;

        BigDecimal balanceDiff = totalDebit.subtract(totalCredit);
        String closingBalanceType = balanceDiff.compareTo(BigDecimal.ZERO) >= 0 ? "Dr" : "Cr";
        BigDecimal closingBalance = balanceDiff.abs();

        BigDecimal currentOutstanding;
        if (!isCustomerPerspective) {
            // Supplier outstanding: Credits (Purchases + Opening Payable) - Debits (Payments + Returns)
            currentOutstanding = totalCredit.subtract(totalDebit);
        } else {
            // Customer outstanding: Debits (Sales + Opening Recv) - Credits (Receipts + Returns)
            currentOutstanding = totalDebit.subtract(totalCredit);
        }

        // Calculate running balances across the matching entries
        List<LedgerEntryDTO> calculatedDTOs = new ArrayList<>();
        BigDecimal runningBalance = BigDecimal.ZERO;

        for (LedgerEntry entry : allMatching) {
            BigDecimal debit = entry.getDebitAmount() != null ? entry.getDebitAmount() : BigDecimal.ZERO;
            BigDecimal credit = entry.getCreditAmount() != null ? entry.getCreditAmount() : BigDecimal.ZERO;

            if (isCustomerPerspective) {
                // Customer: + Debit, - Credit
                runningBalance = runningBalance.add(debit).subtract(credit);
            } else {
                // Supplier: + Credit, - Debit
                runningBalance = runningBalance.add(credit).subtract(debit);
            }

            String balanceType;
            if (isCustomerPerspective) {
                balanceType = runningBalance.compareTo(BigDecimal.ZERO) >= 0 ? "Dr" : "Cr";
            } else {
                balanceType = runningBalance.compareTo(BigDecimal.ZERO) >= 0 ? "Cr" : "Dr";
            }

            String createdByName = entry.getCreatedBy() != null ? entry.getCreatedBy().getName() : "System";

            calculatedDTOs.add(LedgerEntryDTO.builder()
                    .id(entry.getId())
                    .partyId(party.getId())
                    .partyName(party.getPartyName())
                    .transactionDate(entry.getTransactionDate())
                    .transactionType(entry.getTransactionType())
                    .referenceType(entry.getReferenceType())
                    .referenceId(entry.getReferenceId())
                    .referenceNumber(entry.getReferenceNumber())
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .runningBalance(runningBalance.abs())
                    .balanceType(balanceType)
                    .remarks(entry.getRemarks())
                    .createdByName(createdByName)
                    .createdAt(entry.getCreatedAt())
                    .build());
        }

        // Apply pagination in-memory to preserve authoritative running balances
        int totalElements = calculatedDTOs.size();
        int page = (pageable != null) ? pageable.getPageNumber() : 0;
        int size = (pageable != null && pageable.getPageSize() > 0) ? pageable.getPageSize() : Math.max(totalElements, 1);

        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, totalElements);
        List<LedgerEntryDTO> pageContent;

        if (fromIndex >= totalElements) {
            pageContent = new ArrayList<>();
        } else {
            pageContent = calculatedDTOs.subList(fromIndex, toIndex);
        }

        int totalPages = (totalElements == 0) ? 0 : (int) Math.ceil((double) totalElements / size);

        return PartyLedgerResponse.builder()
                .partyId(party.getId())
                .partyCode(party.getPartyCode())
                .partyName(party.getPartyName())
                .mobile(party.getMobile())
                .partyType(party.getPartyType())
                .openingBalance(party.getOpeningBalance())
                .openingBalanceType(party.getOpeningBalanceType())
                .totalDebit(totalDebit)
                .totalCredit(totalCredit)
                .closingBalance(closingBalance)
                .closingBalanceType(closingBalanceType)
                .currentOutstanding(currentOutstanding)
                .entries(pageContent)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }

    private Party getPartyAndValidate(Long partyId, Long businessId) {
        Party party = partyRepository.findById(partyId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found with id: " + partyId));
        if (!party.getBusiness().getId().equals(businessId)) {
            throw new ResourceNotFoundException("Party does not belong to the current business context.");
        }
        return party;
    }
}
