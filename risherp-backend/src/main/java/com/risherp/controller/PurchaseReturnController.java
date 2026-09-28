package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.purchasereturn.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.PurchaseReturnService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * PurchaseReturnController
 * REST APIs for Phase 13 Purchase Return Management.
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PurchaseReturnController {

    private final PurchaseReturnService purchaseReturnService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @PostMapping("/purchase-returns")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_CREATE') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseReturnResponse>> createPurchaseReturn(
            @Valid @RequestBody CreatePurchaseReturnRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {

        Long businessId = principal.getBusinessId();
        String clientIp = httpRequest.getRemoteAddr();

        PurchaseReturnResponse response = purchaseReturnService.createPurchaseReturn(
                request, businessId, principal, clientIp);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase return created successfully", response));
    }

    // =========================================================================
    // LIST / FILTER
    // =========================================================================

    @GetMapping("/purchase-returns")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<Page<PurchaseReturnResponse>>> getPurchaseReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "returnDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PurchaseReturnResponse> result = purchaseReturnService.getPurchaseReturns(
                principal.getBusinessId(), search, partyId, status, fromDate, toDate, pageable);

        return ResponseEntity.ok(ApiResponse.success("Purchase returns retrieved", result));
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================

    @GetMapping("/purchase-returns/summary")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PurchaseReturnSummaryDTO>> getPurchaseReturnSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseReturnSummaryDTO summary = purchaseReturnService.getPurchaseReturnSummary(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Purchase return summary retrieved", summary));
    }

    // =========================================================================
    // GET BY ID
    // =========================================================================

    @GetMapping("/purchase-returns/{id}")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PurchaseReturnResponse>> getPurchaseReturnById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseReturnResponse response = purchaseReturnService.getPurchaseReturnById(id, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Purchase return retrieved", response));
    }

    // =========================================================================
    // GET BY RETURN NUMBER
    // =========================================================================

    @GetMapping("/purchase-returns/number/{returnNumber}")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PurchaseReturnResponse>> getPurchaseReturnByNumber(
            @PathVariable String returnNumber,
            @AuthenticationPrincipal UserPrincipal principal) {
        PurchaseReturnResponse response = purchaseReturnService.getPurchaseReturnByNumber(returnNumber, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Purchase return retrieved", response));
    }

    // =========================================================================
    // GET BY ORIGINAL PURCHASE ID
    // =========================================================================

    @GetMapping("/purchase-returns/purchase/{purchaseId}")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<PurchaseReturnResponse>>> getPurchaseReturnsByPurchase(
            @PathVariable Long purchaseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PurchaseReturnResponse> response = purchaseReturnService.getPurchaseReturnsByPurchase(purchaseId, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Purchase returns for purchase retrieved", response));
    }

    // =========================================================================
    // RETURNABLE ITEMS FOR A PURCHASE
    // =========================================================================

    @GetMapping("/purchases/{purchaseId}/returnable-items")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_CREATE') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<ReturnablePurchaseItemResponse>>> getReturnableItems(
            @PathVariable Long purchaseId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ReturnablePurchaseItemResponse> items = purchaseReturnService.getReturnableItems(purchaseId, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Returnable purchase items retrieved", items));
    }

    // =========================================================================
    // PDF DEBIT NOTE DOWNLOAD
    // =========================================================================

    @GetMapping("/purchase-returns/{id}/pdf")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_PRINT') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<byte[]> downloadPurchaseReturnPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] pdfBytes = purchaseReturnService.generatePurchaseReturnPdf(id, principal.getBusinessId());
        PurchaseReturnResponse pr = purchaseReturnService.getPurchaseReturnById(id, principal.getBusinessId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", pr.getReturnNumber() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // =========================================================================
    // CANCEL
    // =========================================================================

    @PutMapping("/purchase-returns/{id}/cancel")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_CANCEL') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseReturnResponse>> cancelPurchaseReturn(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        PurchaseReturnResponse response = purchaseReturnService.cancelPurchaseReturn(
                id, principal.getBusinessId(), principal, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Purchase return cancelled successfully", response));
    }
}
