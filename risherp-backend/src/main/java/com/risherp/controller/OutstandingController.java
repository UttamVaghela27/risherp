package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.InvoiceOutstandingDTO;
import com.risherp.dto.outstanding.OutstandingSummaryDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import com.risherp.security.UserPrincipal;
import com.risherp.service.OutstandingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/outstanding")
@RequiredArgsConstructor
public class OutstandingController {

    private final OutstandingService outstandingService;

    @GetMapping("/customers")
    @PreAuthorize("hasAuthority('OUTSTANDING_VIEW') or hasAuthority('OUTSTANDING_CUSTOMER_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Page<CustomerOutstandingDTO>>> getCustomerOutstanding(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        Pageable pageable = PageRequest.of(page, size);
        Page<CustomerOutstandingDTO> result = outstandingService.getCustomerOutstanding(businessId, search, dateFrom, dateTo, pageable);
        return ResponseEntity.ok(ApiResponse.success("Customer outstanding records retrieved successfully", result));
    }

    @GetMapping("/suppliers")
    @PreAuthorize("hasAuthority('OUTSTANDING_VIEW') or hasAuthority('OUTSTANDING_SUPPLIER_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Page<SupplierOutstandingDTO>>> getSupplierOutstanding(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        Pageable pageable = PageRequest.of(page, size);
        Page<SupplierOutstandingDTO> result = outstandingService.getSupplierOutstanding(businessId, search, dateFrom, dateTo, pageable);
        return ResponseEntity.ok(ApiResponse.success("Supplier outstanding records retrieved successfully", result));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('OUTSTANDING_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<OutstandingSummaryDTO>> getOutstandingSummary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        OutstandingSummaryDTO summary = outstandingService.getOutstandingSummary(businessId);
        return ResponseEntity.ok(ApiResponse.success("Outstanding summary retrieved successfully", summary));
    }

    @GetMapping("/customer/{partyId}/invoices")
    @PreAuthorize("hasAuthority('OUTSTANDING_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<InvoiceOutstandingDTO>>> getCustomerInvoiceOutstanding(
            @PathVariable Long partyId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        List<InvoiceOutstandingDTO> invoices = outstandingService.getCustomerInvoiceOutstanding(partyId, businessId);
        return ResponseEntity.ok(ApiResponse.success("Customer invoice breakdown retrieved successfully", invoices));
    }

    @GetMapping("/supplier/{partyId}/invoices")
    @PreAuthorize("hasAuthority('OUTSTANDING_VIEW') or hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<List<InvoiceOutstandingDTO>>> getSupplierInvoiceOutstanding(
            @PathVariable Long partyId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Long businessId = principal.getBusinessId();
        List<InvoiceOutstandingDTO> invoices = outstandingService.getSupplierInvoiceOutstanding(partyId, businessId);
        return ResponseEntity.ok(ApiResponse.success("Supplier purchase invoice breakdown retrieved successfully", invoices));
    }
}
