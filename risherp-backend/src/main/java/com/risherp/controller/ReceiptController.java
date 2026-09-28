package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.receipt.*;
import com.risherp.entity.PaymentMode;
import com.risherp.security.UserPrincipal;
import com.risherp.service.ReceiptService;
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
 * ReceiptController
 * REST APIs for Customer Receipts & Settlements.
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReceiptController {

    private final ReceiptService receiptService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @PostMapping("/receipts")
    @PreAuthorize("hasAuthority('RECEIPT_CREATE') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<ReceiptResponse>> createReceipt(
            @Valid @RequestBody CreateReceiptRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {

        Long businessId = principal.getBusinessId();
        String clientIp = httpRequest.getRemoteAddr();

        ReceiptResponse response = receiptService.createReceipt(request, businessId, principal, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Receipt created successfully", response));
    }

    // =========================================================================
    // LIST / FILTER
    // =========================================================================

    @GetMapping("/receipts")
    @PreAuthorize("hasAuthority('RECEIPT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<Page<ReceiptResponse>>> getReceipts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) PaymentMode paymentMode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "receiptDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ReceiptResponse> result = receiptService.getReceipts(
                principal.getBusinessId(), search, partyId, status, paymentMode, fromDate, toDate, pageable);

        return ResponseEntity.ok(ApiResponse.success("Receipts retrieved", result));
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================

    @GetMapping("/receipts/summary")
    @PreAuthorize("hasAuthority('RECEIPT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<ReceiptSummaryDTO>> getReceiptSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        ReceiptSummaryDTO summary = receiptService.getReceiptSummary(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Receipt summary retrieved", summary));
    }

    // =========================================================================
    // GET BY ID
    // =========================================================================

    @GetMapping("/receipts/{id}")
    @PreAuthorize("hasAuthority('RECEIPT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<ReceiptResponse>> getReceiptById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReceiptResponse response = receiptService.getReceiptById(id, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Receipt retrieved", response));
    }

    // =========================================================================
    // GET BY NUMBER
    // =========================================================================

    @GetMapping("/receipts/number/{receiptNumber}")
    @PreAuthorize("hasAuthority('RECEIPT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<ReceiptResponse>> getReceiptByNumber(
            @PathVariable String receiptNumber,
            @AuthenticationPrincipal UserPrincipal principal) {
        ReceiptResponse response = receiptService.getReceiptByNumber(receiptNumber, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Receipt retrieved", response));
    }

    // =========================================================================
    // OUTSTANDING SALES FOR CUSTOMER
    // =========================================================================

    @GetMapping("/sales/customer/{partyId}/outstanding")
    @PreAuthorize("hasAuthority('RECEIPT_CREATE') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<OutstandingSaleResponse>>> getOutstandingSales(
            @PathVariable Long partyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<OutstandingSaleResponse> sales = receiptService.getOutstandingSales(partyId, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Outstanding sales invoices retrieved", sales));
    }

    // =========================================================================
    // PDF DOWNLOAD
    // =========================================================================

    @GetMapping("/receipts/{id}/pdf")
    @PreAuthorize("hasAuthority('RECEIPT_PRINT') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<byte[]> downloadReceiptPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] pdfBytes = receiptService.generateReceiptPdf(id, principal.getBusinessId());
        ReceiptResponse r = receiptService.getReceiptById(id, principal.getBusinessId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", r.getReceiptNumber() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // =========================================================================
    // CANCEL
    // =========================================================================

    @PutMapping("/receipts/{id}/cancel")
    @PreAuthorize("hasAuthority('RECEIPT_CANCEL') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<ReceiptResponse>> cancelReceipt(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        ReceiptResponse response = receiptService.cancelReceipt(
                id, principal.getBusinessId(), principal, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Receipt cancelled successfully", response));
    }
}
