package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.salesreturn.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.SalesReturnService;
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
import java.util.List;

/**
 * SalesReturnController — REST API for Phase 12 Sales Return module.
 *
 * POST   /api/sales-returns                          Create return
 * GET    /api/sales-returns                          Paginated history
 * GET    /api/sales-returns/summary                  KPI aggregates
 * GET    /api/sales-returns/{id}                     Detail by ID
 * GET    /api/sales-returns/{id}/pdf                 PDF download
 * PUT    /api/sales-returns/{id}/cancel              Cancel return
 * GET    /api/sales-returns/number/{returnNumber}    Lookup by number
 * GET    /api/sales-returns/sale/{saleId}            Returns for a sale
 * GET    /api/sales/{saleId}/returnable-items        Returnable item quantities
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class SalesReturnController {

    private final SalesReturnService salesReturnService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @PostMapping("/api/sales-returns")
    @PreAuthorize("hasAuthority('SALES_RETURN_CREATE') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<SalesReturnResponse>> createSalesReturn(
            @Valid @RequestBody CreateSalesReturnRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        SalesReturnResponse response = salesReturnService.createSalesReturn(request, businessId, principal, extractClientIp(servletRequest));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sales return " + response.getReturnNumber() + " created successfully", response));
    }

    // =========================================================================
    // READ — LIST
    // =========================================================================

    @GetMapping("/api/sales-returns")
    @PreAuthorize("hasAuthority('SALES_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<PagedResponse<SalesReturnResponse>>> getSalesReturns(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "returnDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {

        if (size > 100) size = 100;
        if (page < 0) page = 0;

        Long businessId = getBusinessId(getPrincipal(authentication));
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<SalesReturnResponse> returns = salesReturnService.getSalesReturns(
                businessId, search, partyId, status, fromDate, toDate, pageable);
        return ResponseEntity.ok(ApiResponse.success("Sales returns retrieved successfully", PagedResponse.from(returns)));
    }

    // =========================================================================
    // READ — SUMMARY
    // =========================================================================

    @GetMapping("/api/sales-returns/summary")
    @PreAuthorize("hasAuthority('SALES_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<SalesReturnSummaryDTO>> getSalesReturnSummary(Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        return ResponseEntity.ok(ApiResponse.success("Summary retrieved", salesReturnService.getSalesReturnSummary(businessId)));
    }

    // =========================================================================
    // READ — SINGLE
    // =========================================================================

    @GetMapping("/api/sales-returns/{id}")
    @PreAuthorize("hasAuthority('SALES_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<SalesReturnResponse>> getSalesReturnById(
            @PathVariable Long id,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        return ResponseEntity.ok(ApiResponse.success("Sales return retrieved", salesReturnService.getSalesReturnById(id, businessId)));
    }

    @GetMapping("/api/sales-returns/number/{returnNumber}")
    @PreAuthorize("hasAuthority('SALES_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<SalesReturnResponse>> getSalesReturnByNumber(
            @PathVariable String returnNumber,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        return ResponseEntity.ok(ApiResponse.success("Sales return retrieved", salesReturnService.getSalesReturnByNumber(returnNumber, businessId)));
    }

    @GetMapping("/api/sales-returns/sale/{saleId}")
    @PreAuthorize("hasAuthority('SALES_RETURN_VIEW') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<SalesReturnResponse>>> getSalesReturnsBySale(
            @PathVariable Long saleId,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        return ResponseEntity.ok(ApiResponse.success("Returns for sale retrieved", salesReturnService.getSalesReturnsBySale(saleId, businessId)));
    }

    // =========================================================================
    // RETURNABLE ITEMS (attaches to /api/sales/{saleId}/returnable-items)
    // =========================================================================

    @GetMapping("/api/sales/{saleId}/returnable-items")
    @PreAuthorize("hasAuthority('SALES_RETURN_CREATE') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<ReturnableSaleItemResponse>>> getReturnableItems(
            @PathVariable Long saleId,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        return ResponseEntity.ok(ApiResponse.success("Returnable items retrieved", salesReturnService.getReturnableItems(saleId, businessId)));
    }

    // =========================================================================
    // PDF
    // =========================================================================

    @GetMapping("/api/sales-returns/{id}/pdf")
    @PreAuthorize("hasAuthority('SALES_RETURN_PRINT') or hasRole('ADMIN') or hasRole('MANAGER') or hasRole('STAFF')")
    public ResponseEntity<byte[]> downloadSalesReturnPdf(
            @PathVariable Long id,
            Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        SalesReturnResponse sr = salesReturnService.getSalesReturnById(id, businessId);
        byte[] pdf = salesReturnService.generateSalesReturnPdf(id, businessId);
        String filename = (sr.getReturnNumber() != null ? sr.getReturnNumber() : "return") + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    // =========================================================================
    // CANCEL
    // =========================================================================

    @PutMapping("/api/sales-returns/{id}/cancel")
    @PreAuthorize("hasAuthority('SALES_RETURN_CANCEL') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<SalesReturnResponse>> cancelSalesReturn(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest servletRequest) {
        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        SalesReturnResponse response = salesReturnService.cancelSalesReturn(id, businessId, principal, extractClientIp(servletRequest));
        return ResponseEntity.ok(ApiResponse.success("Sales return " + response.getReturnNumber() + " cancelled", response));
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private UserPrincipal getPrincipal(Authentication auth) {
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) return (UserPrincipal) auth.getPrincipal();
        return null;
    }

    private Long getBusinessId(UserPrincipal principal) {
        if (principal != null && principal.getBusinessId() != null) return principal.getBusinessId();
        return 1L;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isEmpty() && !"unknown".equalsIgnoreCase(xff)) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }
}
