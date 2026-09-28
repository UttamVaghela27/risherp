package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.payment.*;
import com.risherp.entity.PaymentMode;
import com.risherp.security.UserPrincipal;
import com.risherp.service.PaymentTxnService;
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
 * PaymentTxnController
 * REST APIs for Supplier Payments & Settlements.
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentTxnController {

    private final PaymentTxnService paymentTxnService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @PostMapping("/payments")
    @PreAuthorize("hasAuthority('PAYMENT_CREATE') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {

        Long businessId = principal.getBusinessId();
        String clientIp = httpRequest.getRemoteAddr();

        PaymentResponse response = paymentTxnService.createPayment(request, businessId, principal, clientIp);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created successfully", response));
    }

    // =========================================================================
    // LIST / FILTER
    // =========================================================================

    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('PAYMENT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) PaymentMode paymentMode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "paymentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @AuthenticationPrincipal UserPrincipal principal) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PaymentResponse> result = paymentTxnService.getPayments(
                principal.getBusinessId(), search, partyId, status, paymentMode, fromDate, toDate, pageable);

        return ResponseEntity.ok(ApiResponse.success("Payments retrieved", result));
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================

    @GetMapping("/payments/summary")
    @PreAuthorize("hasAuthority('PAYMENT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PaymentSummaryDTO>> getPaymentSummary(
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentSummaryDTO summary = paymentTxnService.getPaymentSummary(principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Payment summary retrieved", summary));
    }

    // =========================================================================
    // GET BY ID
    // =========================================================================

    @GetMapping("/payments/{id}")
    @PreAuthorize("hasAuthority('PAYMENT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentTxnService.getPaymentById(id, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved", response));
    }

    // =========================================================================
    // GET BY NUMBER
    // =========================================================================

    @GetMapping("/payments/number/{paymentNumber}")
    @PreAuthorize("hasAuthority('PAYMENT_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByNumber(
            @PathVariable String paymentNumber,
            @AuthenticationPrincipal UserPrincipal principal) {
        PaymentResponse response = paymentTxnService.getPaymentByNumber(paymentNumber, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved", response));
    }

    // =========================================================================
    // OUTSTANDING PURCHASES FOR SUPPLIER
    // =========================================================================

    @GetMapping("/purchases/supplier/{partyId}/outstanding")
    @PreAuthorize("hasAuthority('PAYMENT_CREATE') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<OutstandingPurchaseResponse>>> getOutstandingPurchases(
            @PathVariable Long partyId,
            @AuthenticationPrincipal UserPrincipal principal) {
        List<OutstandingPurchaseResponse> purchases = paymentTxnService.getOutstandingPurchases(partyId, principal.getBusinessId());
        return ResponseEntity.ok(ApiResponse.success("Outstanding purchase invoices retrieved", purchases));
    }

    // =========================================================================
    // PDF DOWNLOAD
    // =========================================================================

    @GetMapping("/payments/{id}/pdf")
    @PreAuthorize("hasAuthority('PAYMENT_PRINT') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<byte[]> downloadPaymentPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        byte[] pdfBytes = paymentTxnService.generatePaymentPdf(id, principal.getBusinessId());
        PaymentResponse p = paymentTxnService.getPaymentById(id, principal.getBusinessId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", p.getPaymentNumber() + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // =========================================================================
    // CANCEL
    // =========================================================================

    @PutMapping("/payments/{id}/cancel")
    @PreAuthorize("hasAuthority('PAYMENT_CANCEL') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PaymentResponse>> cancelPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest httpRequest) {
        PaymentResponse response = paymentTxnService.cancelPayment(
                id, principal.getBusinessId(), principal, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success("Payment cancelled successfully", response));
    }
}
