package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.purchase.CreatePurchaseRequest;
import com.risherp.dto.purchase.PurchaseResponse;
import com.risherp.dto.purchase.PurchaseSummaryDTO;
import com.risherp.entity.PaymentStatus;
import com.risherp.entity.PurchaseStatus;
import com.risherp.security.UserPrincipal;
import com.risherp.service.PurchaseService;
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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * PurchaseController — REST API for Purchase Entry & Management.
 *
 * POST   /api/purchases                          Create new purchase
 * GET    /api/purchases                          Paginated purchases list with filters
 * GET    /api/purchases/summary                  Summary metrics
 * GET    /api/purchases/{id}                     Purchase detail by ID
 * GET    /api/purchases/{id}/pdf                 Download PDF purchase voucher
 * GET    /api/purchases/number/{purchaseNumber}  Look up by purchase number
 * GET    /api/purchases/supplier/{partyId}       All purchases from a supplier
 */
@Slf4j
@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @PreAuthorize("hasAuthority('PURCHASE_CREATE') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PurchaseResponse>> createPurchase(
            @Valid @RequestBody CreatePurchaseRequest request,
            Authentication authentication) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);

        PurchaseResponse response = purchaseService.createPurchase(request, businessId, principal);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Purchase " + response.getPurchaseNumber() + " created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseResponse>>> getPurchases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "purchaseDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {

        if (size > 100) size = 100;
        if (page < 0) page = 0;

        Long businessId = getBusinessId(getPrincipal(authentication));
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        PaymentStatus payStatus = null;
        if (paymentStatus != null && !paymentStatus.isEmpty() && !paymentStatus.equals("ALL")) {
            try { payStatus = PaymentStatus.valueOf(paymentStatus); } catch (IllegalArgumentException ignored) {}
        }

        PurchaseStatus purStatus = null;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            try { purStatus = PurchaseStatus.valueOf(status); } catch (IllegalArgumentException ignored) {}
        }

        Page<PurchaseResponse> purchases = purchaseService.getPurchases(businessId, search, fromDate, toDate, partyId, payStatus, purStatus, pageable);
        return ResponseEntity.ok(ApiResponse.success("Purchases retrieved successfully", PagedResponse.from(purchases)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public ResponseEntity<ApiResponse<PurchaseSummaryDTO>> getPurchaseSummary(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));

        PaymentStatus payStatus = null;
        if (paymentStatus != null && !paymentStatus.isEmpty() && !paymentStatus.equals("ALL")) {
            try { payStatus = PaymentStatus.valueOf(paymentStatus); } catch (IllegalArgumentException ignored) {}
        }

        PurchaseStatus purStatus = null;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            try { purStatus = PurchaseStatus.valueOf(status); } catch (IllegalArgumentException ignored) {}
        }

        PurchaseSummaryDTO summary = purchaseService.getPurchaseSummary(businessId, search, partyId, payStatus, purStatus, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Purchase summary retrieved", summary));
    }

    @GetMapping("/number/{purchaseNumber}")
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public ResponseEntity<ApiResponse<PurchaseResponse>> getPurchaseByNumber(
            @PathVariable String purchaseNumber,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        PurchaseResponse response = purchaseService.getPurchaseByNumber(purchaseNumber, businessId);
        return ResponseEntity.ok(ApiResponse.success("Purchase retrieved successfully", response));
    }

    @GetMapping("/supplier/{partyId}")
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<PurchaseResponse>>> getPurchasesBySupplier(
            @PathVariable Long partyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        if (size > 100) size = 100;
        if (page < 0) page = 0;

        Long businessId = getBusinessId(getPrincipal(authentication));
        Pageable pageable = PageRequest.of(page, size, Sort.by("purchaseDate").descending());
        Page<PurchaseResponse> purchases = purchaseService.getSupplierPurchases(partyId, businessId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Supplier purchases retrieved", PagedResponse.from(purchases)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PURCHASE_VIEW')")
    public ResponseEntity<ApiResponse<PurchaseResponse>> getPurchaseById(
            @PathVariable Long id,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        PurchaseResponse response = purchaseService.getPurchaseById(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Purchase retrieved successfully", response));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('PURCHASE_PRINT') or hasAuthority('PURCHASE_VIEW')")
    public ResponseEntity<byte[]> downloadPurchasePdf(
            @PathVariable Long id,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        PurchaseResponse purchase = purchaseService.getPurchaseById(id, businessId);
        byte[] pdfBytes = purchaseService.generatePurchasePdf(id, businessId);

        String filename = (purchase.getPurchaseNumber() != null ? purchase.getPurchaseNumber() : "purchase") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('PURCHASE_CANCEL') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<PurchaseResponse>> cancelPurchase(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        PurchaseResponse response = purchaseService.cancelPurchase(id, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Purchase " + response.getPurchaseNumber() + " cancelled successfully", response));
    }

    // ---- Helpers ----

    private UserPrincipal getPrincipal(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    private Long getBusinessId(UserPrincipal principal) {
        if (principal != null && principal.getBusinessId() != null) {
            return principal.getBusinessId();
        }
        return 1L;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
