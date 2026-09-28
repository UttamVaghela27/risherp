package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.sales.CreateSaleRequest;
import com.risherp.dto.sales.SaleResponse;
import com.risherp.dto.sales.SaleSummaryDTO;
import com.risherp.entity.SaleStatus;
import com.risherp.security.UserPrincipal;
import com.risherp.service.SaleService;
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
 * SaleController — REST API for Sales & Billing module.
 *
 * POST   /api/sales                        Create new sale
 * GET    /api/sales                        Paginated sales history with filters
 * GET    /api/sales/summary                KPI aggregates with optional filters
 * GET    /api/sales/{id}                   Full sale detail by ID
 * GET    /api/sales/{id}/pdf               Authoritative invoice PDF download
 * PUT    /api/sales/{id}/cancel            Cancel sale and reverse stock
 * GET    /api/sales/invoice/{invoiceNumber} Look up by invoice number
 * GET    /api/sales/customer/{partyId}     All sales for a customer
 */
@Slf4j
@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    @PreAuthorize("hasAuthority('SALE_CREATE') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<SaleResponse>> createSale(
            @Valid @RequestBody CreateSaleRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        SaleResponse response = saleService.createSale(request, businessId, principal, clientIp);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sale " + response.getInvoiceNumber() + " created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<SaleResponse>>> getSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "saleDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {

        // Validate max page size
        if (size > 100) size = 100;
        if (page < 0) page = 0;

        Long businessId = getBusinessId(getPrincipal(authentication));
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        SaleStatus saleStatus = null;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            try { saleStatus = SaleStatus.valueOf(status); } catch (IllegalArgumentException ignored) {}
        }

        Page<SaleResponse> sales = saleService.getSales(businessId, search, partyId, paymentStatus, saleStatus, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Sales retrieved successfully", PagedResponse.from(sales)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public ResponseEntity<ApiResponse<SaleSummaryDTO>> getSaleSummary(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));
        SaleStatus saleStatus = null;
        if (status != null && !status.isEmpty() && !status.equals("ALL")) {
            try { saleStatus = SaleStatus.valueOf(status); } catch (IllegalArgumentException ignored) {}
        }

        SaleSummaryDTO summary = saleService.getSaleSummary(businessId, search, partyId, paymentStatus, saleStatus, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success("Sales summary retrieved", summary));
    }

    @GetMapping("/invoice/{invoiceNumber}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public ResponseEntity<ApiResponse<SaleResponse>> getSaleByInvoiceNumber(
            @PathVariable String invoiceNumber,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        SaleResponse response = saleService.getSaleByInvoiceNumber(invoiceNumber, businessId);
        return ResponseEntity.ok(ApiResponse.success("Sale retrieved successfully", response));
    }

    @GetMapping("/customer/{partyId}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public ResponseEntity<ApiResponse<PagedResponse<SaleResponse>>> getSalesByCustomer(
            @PathVariable Long partyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        if (size > 100) size = 100;
        if (page < 0) page = 0;

        Long businessId = getBusinessId(getPrincipal(authentication));
        Pageable pageable = PageRequest.of(page, size, Sort.by("saleDate").descending());
        Page<SaleResponse> sales = saleService.getSalesByCustomer(partyId, businessId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Customer sales retrieved", PagedResponse.from(sales)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SALES_VIEW')")
    public ResponseEntity<ApiResponse<SaleResponse>> getSaleById(
            @PathVariable Long id,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        SaleResponse response = saleService.getSaleById(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Sale retrieved successfully", response));
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('SALES_PRINT')")
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable Long id,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        SaleResponse sale = saleService.getSaleById(id, businessId);
        byte[] pdfBytes = saleService.generateInvoicePdf(id, businessId);

        String filename = (sale.getInvoiceNumber() != null ? sale.getInvoiceNumber() : "invoice") + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAuthority('SALES_CANCEL')")
    public ResponseEntity<ApiResponse<SaleResponse>> cancelSale(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        SaleResponse response = saleService.cancelSale(id, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Sale " + response.getInvoiceNumber() + " cancelled successfully", response));
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
