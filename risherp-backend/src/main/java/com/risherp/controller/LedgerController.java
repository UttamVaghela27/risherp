package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.ledger.LedgerSummaryDTO;
import com.risherp.dto.ledger.PartyLedgerResponse;
import com.risherp.entity.LedgerTransactionType;
import com.risherp.security.UserPrincipal;
import com.risherp.service.FinancialPostingService;
import com.risherp.service.LedgerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@Slf4j
@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {

    private final LedgerService ledgerService;
    private final FinancialPostingService financialPostingService;

    @GetMapping("/customer/{partyId}")
    @PreAuthorize("hasAuthority('LEDGER_VIEW') or hasAuthority('LEDGER_CUSTOMER_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PartyLedgerResponse>> getCustomerLedger(
            @PathVariable Long partyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) LedgerTransactionType txnType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        Pageable pageable = PageRequest.of(page, size);
        PartyLedgerResponse response = ledgerService.getCustomerLedger(partyId, businessId, dateFrom, dateTo, txnType, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Customer ledger retrieved successfully", response));
    }

    @GetMapping("/supplier/{partyId}")
    @PreAuthorize("hasAuthority('LEDGER_VIEW') or hasAuthority('LEDGER_SUPPLIER_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PartyLedgerResponse>> getSupplierLedger(
            @PathVariable Long partyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) LedgerTransactionType txnType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        Pageable pageable = PageRequest.of(page, size);
        PartyLedgerResponse response = ledgerService.getSupplierLedger(partyId, businessId, dateFrom, dateTo, txnType, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Supplier ledger retrieved successfully", response));
    }

    @GetMapping("/party/{partyId}")
    @PreAuthorize("hasAuthority('LEDGER_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PartyLedgerResponse>> getPartyLedger(
            @PathVariable Long partyId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) LedgerTransactionType txnType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        Pageable pageable = PageRequest.of(page, size);
        PartyLedgerResponse response = ledgerService.getPartyLedger(partyId, businessId, dateFrom, dateTo, txnType, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("Party ledger retrieved successfully", response));
    }

    @GetMapping("/party/{partyId}/summary")
    @PreAuthorize("hasAuthority('LEDGER_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<LedgerSummaryDTO>> getPartyLedgerSummary(
            @PathVariable Long partyId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        LedgerSummaryDTO response = ledgerService.getPartyLedgerSummary(partyId, businessId);
        return ResponseEntity.ok(ApiResponse.success("Party ledger summary retrieved successfully", response));
    }

    @PostMapping("/sync")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<String>> syncLedger(@AuthenticationPrincipal UserPrincipal principal) {
        Long businessId = principal.getBusinessId();
        financialPostingService.syncAllExistingRecords(businessId);
        return ResponseEntity.ok(ApiResponse.success("All existing transactions synced into ledger", "Synchronization complete"));
    }
}
