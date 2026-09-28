package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.dashboard.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * DashboardController
 * REST APIs for the real-time business dashboard.
 * Requires authenticated JWT session.
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication) {

        Long businessId = extractBusinessId(authentication);
        DashboardSummaryDTO data = dashboardService.getSummary(businessId, fromDate, toDate);

        return ResponseEntity.ok(ApiResponse.success("Dashboard summary fetched successfully", data));
    }

    @GetMapping("/sales-overview")
    public ResponseEntity<ApiResponse<List<SalesOverviewDTO>>> getSalesOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication) {

        Long businessId = extractBusinessId(authentication);
        List<SalesOverviewDTO> data = dashboardService.getSalesOverview(businessId, fromDate, toDate);

        return ResponseEntity.ok(ApiResponse.success("Sales overview fetched successfully", data));
    }

    @GetMapping("/purchase-overview")
    public ResponseEntity<ApiResponse<List<PurchaseOverviewDTO>>> getPurchaseOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            Authentication authentication) {

        Long businessId = extractBusinessId(authentication);
        List<PurchaseOverviewDTO> data = dashboardService.getPurchaseOverview(businessId, fromDate, toDate);

        return ResponseEntity.ok(ApiResponse.success("Purchase overview fetched successfully", data));
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<ApiResponse<List<RecentTransactionDTO>>> getRecentTransactions(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {

        Long businessId = extractBusinessId(authentication);
        List<RecentTransactionDTO> data = dashboardService.getRecentTransactions(businessId, limit);

        return ResponseEntity.ok(ApiResponse.success("Recent transactions fetched successfully", data));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<LowStockDTO>>> getLowStock(Authentication authentication) {
        Long businessId = extractBusinessId(authentication);
        List<LowStockDTO> data = dashboardService.getLowStockItems(businessId);

        return ResponseEntity.ok(ApiResponse.success("Low stock items fetched successfully", data));
    }

    @GetMapping("/customer-outstanding")
    public ResponseEntity<ApiResponse<List<OutstandingDTO>>> getCustomerOutstanding(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication) {

        Long businessId = extractBusinessId(authentication);
        List<OutstandingDTO> data = dashboardService.getCustomerOutstanding(businessId, limit);

        return ResponseEntity.ok(ApiResponse.success("Customer outstanding fetched successfully", data));
    }

    @GetMapping("/supplier-outstanding")
    public ResponseEntity<ApiResponse<List<OutstandingDTO>>> getSupplierOutstanding(
            @RequestParam(defaultValue = "5") int limit,
            Authentication authentication) {

        Long businessId = extractBusinessId(authentication);
        List<OutstandingDTO> data = dashboardService.getSupplierOutstanding(businessId, limit);

        return ResponseEntity.ok(ApiResponse.success("Supplier outstanding fetched successfully", data));
    }

    @GetMapping("/admin-overview")
    public ResponseEntity<ApiResponse<AdminOverviewDTO>> getAdminOverview(Authentication authentication) {
        Long businessId = extractBusinessId(authentication);
        AdminOverviewDTO data = dashboardService.getAdminOverview(businessId);
        return ResponseEntity.ok(ApiResponse.success("Admin overview fetched successfully", data));
    }

    private Long extractBusinessId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) authentication.getPrincipal()).getBusinessId();
        }
        return 1L; // Safe fallback for development
    }
}
