package com.risherp.controller;

import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import com.risherp.dto.report.*;
import com.risherp.entity.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.ReportPdfService;
import com.risherp.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ReportPdfService reportPdfService;

    // =========================================================================
    // 1. SALES REPORTS
    // =========================================================================

    @GetMapping("/sales")
    @PreAuthorize("hasAuthority('SALES_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse<SalesReportItemDTO, SalesSummaryDTO>> getSalesReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) SaleType saleType,
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "saleDate,desc") String[] sort
    ) {
        Pageable pageable = createPageable(page, size, sort, "saleDate");
        return ResponseEntity.ok(reportService.getSalesReport(
                user.getBusinessId(), dateFrom, dateTo, partyId, itemId, categoryId,
                paymentStatus, saleType, status, search, pageable
        ));
    }

    @GetMapping("/sales/summary")
    @PreAuthorize("hasAuthority('SALES_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<SalesSummaryDTO> getSalesSummary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) SaleStatus status
    ) {
        return ResponseEntity.ok(reportService.getSalesSummary(user.getBusinessId(), dateFrom, dateTo, partyId, status));
    }

    @GetMapping("/sales/items")
    @PreAuthorize("hasAuthority('SALES_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<ItemWiseSalesDTO>> getItemWiseSales(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(reportService.getItemWiseSales(user.getBusinessId(), dateFrom, dateTo, categoryId, search));
    }

    @GetMapping("/sales/parties")
    @PreAuthorize("hasAuthority('SALES_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<PartyWiseSalesDTO>> getPartyWiseSales(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(reportService.getPartyWiseSales(user.getBusinessId(), dateFrom, dateTo, search));
    }

    @GetMapping("/sales/daily")
    @PreAuthorize("hasAuthority('SALES_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<DailySalesDTO>> getDailySales(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        return ResponseEntity.ok(reportService.getDailySales(user.getBusinessId(), dateFrom, dateTo));
    }

    @GetMapping("/sales/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getSalesReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) SaleType saleType,
            @RequestParam(required = false) SaleStatus status,
            @RequestParam(required = false) String search
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("saleDate").descending());
        var res = reportService.getSalesReport(
                user.getBusinessId(), dateFrom, dateTo, partyId, itemId, categoryId,
                paymentStatus, saleType, status, search, all
        );
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generateSalesReportPdf(res.getData(), res.getSummary(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "SalesReport.pdf");
    }

    // =========================================================================
    // 2. PURCHASE REPORTS
    // =========================================================================

    @GetMapping("/purchases")
    @PreAuthorize("hasAuthority('PURCHASE_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse<PurchaseReportItemDTO, PurchaseSummaryDTO>> getPurchaseReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) PurchaseType purchaseType,
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "purchaseDate,desc") String[] sort
    ) {
        Pageable pageable = createPageable(page, size, sort, "purchaseDate");
        return ResponseEntity.ok(reportService.getPurchaseReport(
                user.getBusinessId(), dateFrom, dateTo, supplierId, itemId, categoryId,
                paymentStatus, purchaseType, status, search, pageable
        ));
    }

    @GetMapping("/purchases/summary")
    @PreAuthorize("hasAuthority('PURCHASE_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<PurchaseSummaryDTO> getPurchaseSummary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) PurchaseStatus status
    ) {
        return ResponseEntity.ok(reportService.getPurchaseSummary(user.getBusinessId(), dateFrom, dateTo, supplierId, status));
    }

    @GetMapping("/purchases/items")
    @PreAuthorize("hasAuthority('PURCHASE_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<ItemWisePurchaseDTO>> getItemWisePurchases(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(reportService.getItemWisePurchases(user.getBusinessId(), dateFrom, dateTo, categoryId, search));
    }

    @GetMapping("/purchases/suppliers")
    @PreAuthorize("hasAuthority('PURCHASE_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<SupplierWisePurchaseDTO>> getSupplierWisePurchases(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(reportService.getSupplierWisePurchases(user.getBusinessId(), dateFrom, dateTo, search));
    }

    @GetMapping("/purchases/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getPurchaseReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) PurchaseType purchaseType,
            @RequestParam(required = false) PurchaseStatus status,
            @RequestParam(required = false) String search
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("purchaseDate").descending());
        var res = reportService.getPurchaseReport(
                user.getBusinessId(), dateFrom, dateTo, supplierId, itemId, categoryId,
                paymentStatus, purchaseType, status, search, all
        );
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generatePurchaseReportPdf(res.getData(), res.getSummary(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "PurchaseReport.pdf");
    }

    // =========================================================================
    // 3. STOCK REPORTS
    // =========================================================================

    @GetMapping("/stock")
    @PreAuthorize("hasAuthority('STOCK_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse<StockReportItemDTO, StockSummaryDTO>> getStockReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "itemName,asc") String[] sort
    ) {
        Pageable pageable = createPageable(page, size, sort, "itemName");
        return ResponseEntity.ok(reportService.getStockReport(user.getBusinessId(), categoryId, stockStatus, search, pageable));
    }

    @GetMapping("/stock/summary")
    @PreAuthorize("hasAuthority('STOCK_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<StockSummaryDTO> getStockSummary(@AuthenticationPrincipal UserPrincipal user) {
        return ResponseEntity.ok(reportService.getStockSummary(user.getBusinessId()));
    }

    @GetMapping("/stock/movement")
    @PreAuthorize("hasAuthority('STOCK_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<Page<StockMovementDTO>> getStockMovement(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String transactionType,
            @RequestParam(required = false) String referenceType,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(reportService.getStockMovement(
                user.getBusinessId(), itemId, dateFrom, dateTo, transactionType, referenceType, search, pageable
        ));
    }

    @GetMapping("/stock/low-stock")
    @PreAuthorize("hasAuthority('STOCK_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<LowStockDTO>> getLowStockReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(reportService.getLowStockReport(user.getBusinessId(), categoryId, search));
    }

    @GetMapping("/stock/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getStockReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(required = false) String search
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("itemName").ascending());
        var res = reportService.getStockReport(user.getBusinessId(), categoryId, stockStatus, search, all);
        byte[] pdf = reportPdfService.generateStockReportPdf(res.getData(), res.getSummary(), "All Stock Items", user.getBusinessName());
        return createPdfResponse(pdf, "StockReport.pdf");
    }

    // =========================================================================
    // 4. PROFIT REPORT
    // =========================================================================

    @GetMapping("/profit")
    @PreAuthorize("hasAuthority('PROFIT_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ProfitSummaryDTO> getProfitReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long categoryId
    ) {
        return ResponseEntity.ok(reportService.getProfitSummary(user.getBusinessId(), dateFrom, dateTo, categoryId));
    }

    @GetMapping("/profit/summary")
    @PreAuthorize("hasAuthority('PROFIT_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ProfitSummaryDTO> getProfitSummary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long categoryId
    ) {
        return ResponseEntity.ok(reportService.getProfitSummary(user.getBusinessId(), dateFrom, dateTo, categoryId));
    }

    @GetMapping("/profit/items")
    @PreAuthorize("hasAuthority('PROFIT_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<List<ItemWiseProfitDTO>> getItemWiseProfit(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(reportService.getItemWiseProfit(user.getBusinessId(), dateFrom, dateTo, categoryId, search));
    }

    @GetMapping("/profit/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getProfitReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        var summary = reportService.getProfitSummary(user.getBusinessId(), dateFrom, dateTo, categoryId);
        var items = reportService.getItemWiseProfit(user.getBusinessId(), dateFrom, dateTo, categoryId, search);
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generateProfitReportPdf(items, summary, filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "ProfitReport.pdf");
    }

    // =========================================================================
    // 5. OUTSTANDING REPORTS (REUSING PHASE 15)
    // =========================================================================

    @GetMapping("/outstanding/customers")
    @PreAuthorize("hasAuthority('OUTSTANDING_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<Page<CustomerOutstandingDTO>> getCustomerOutstandingReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(reportService.getCustomerOutstandingReport(user.getBusinessId(), search, dateFrom, dateTo, pageable));
    }

    @GetMapping("/outstanding/customers/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getCustomerOutstandingPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("name").ascending());
        var page = reportService.getCustomerOutstandingReport(user.getBusinessId(), search, dateFrom, dateTo, all);
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generateCustomerOutstandingPdf(page.getContent(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "CustomerOutstandingReport.pdf");
    }

    @GetMapping("/outstanding/suppliers")
    @PreAuthorize("hasAuthority('OUTSTANDING_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<Page<SupplierOutstandingDTO>> getSupplierOutstandingReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name").ascending());
        return ResponseEntity.ok(reportService.getSupplierOutstandingReport(user.getBusinessId(), search, dateFrom, dateTo, pageable));
    }

    @GetMapping("/outstanding/suppliers/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getSupplierOutstandingPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("name").ascending());
        var page = reportService.getSupplierOutstandingReport(user.getBusinessId(), search, dateFrom, dateTo, all);
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generateSupplierOutstandingPdf(page.getContent(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "SupplierOutstandingReport.pdf");
    }

    // =========================================================================
    // 6. RECEIPT REPORTS
    // =========================================================================

    @GetMapping("/receipts")
    @PreAuthorize("hasAuthority('RECEIPT_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse<ReceiptReportItemDTO, ReceiptSummaryDTO>> getReceiptReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PaymentMode paymentMode,
            @RequestParam(required = false) ReceiptStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "receiptDate,desc") String[] sort
    ) {
        Pageable pageable = createPageable(page, size, sort, "receiptDate");
        return ResponseEntity.ok(reportService.getReceiptReport(
                user.getBusinessId(), dateFrom, dateTo, partyId, paymentMode, status, search, pageable
        ));
    }

    @GetMapping("/receipts/summary")
    @PreAuthorize("hasAuthority('RECEIPT_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReceiptSummaryDTO> getReceiptSummary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) ReceiptStatus status
    ) {
        return ResponseEntity.ok(reportService.getReceiptSummary(user.getBusinessId(), dateFrom, dateTo, partyId, status));
    }

    @GetMapping("/receipts/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getReceiptReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PaymentMode paymentMode,
            @RequestParam(required = false) ReceiptStatus status,
            @RequestParam(required = false) String search
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("receiptDate").descending());
        var res = reportService.getReceiptReport(user.getBusinessId(), dateFrom, dateTo, partyId, paymentMode, status, search, all);
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generateReceiptReportPdf(res.getData(), res.getSummary(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "ReceiptReport.pdf");
    }

    // =========================================================================
    // 7. PAYMENT REPORTS
    // =========================================================================

    @GetMapping("/payments")
    @PreAuthorize("hasAuthority('PAYMENT_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse<PaymentReportItemDTO, PaymentSummaryDTO>> getPaymentReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PaymentMode paymentMode,
            @RequestParam(required = false) PaymentTxnStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "paymentDate,desc") String[] sort
    ) {
        Pageable pageable = createPageable(page, size, sort, "paymentDate");
        return ResponseEntity.ok(reportService.getPaymentReport(
                user.getBusinessId(), dateFrom, dateTo, partyId, paymentMode, status, search, pageable
        ));
    }

    @GetMapping("/payments/summary")
    @PreAuthorize("hasAuthority('PAYMENT_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<PaymentSummaryDTO> getPaymentSummary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PaymentTxnStatus status
    ) {
        return ResponseEntity.ok(reportService.getPaymentSummary(user.getBusinessId(), dateFrom, dateTo, partyId, status));
    }

    @GetMapping("/payments/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getPaymentReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PaymentMode paymentMode,
            @RequestParam(required = false) PaymentTxnStatus status,
            @RequestParam(required = false) String search
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("paymentDate").descending());
        var res = reportService.getPaymentReport(user.getBusinessId(), dateFrom, dateTo, partyId, paymentMode, status, search, all);
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generatePaymentReportPdf(res.getData(), res.getSummary(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "PaymentReport.pdf");
    }

    // =========================================================================
    // 8. SALES RETURN REPORTS
    // =========================================================================

    @GetMapping("/sales-returns")
    @PreAuthorize("hasAuthority('SALES_RETURN_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse<SalesReturnReportItemDTO, SalesReturnSummaryDTO>> getSalesReturnReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) SalesReturnStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "returnDate,desc") String[] sort
    ) {
        Pageable pageable = createPageable(page, size, sort, "returnDate");
        return ResponseEntity.ok(reportService.getSalesReturnReport(
                user.getBusinessId(), dateFrom, dateTo, partyId, status, search, pageable
        ));
    }

    @GetMapping("/sales-returns/summary")
    @PreAuthorize("hasAuthority('SALES_RETURN_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<SalesReturnSummaryDTO> getSalesReturnSummary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) SalesReturnStatus status
    ) {
        return ResponseEntity.ok(reportService.getSalesReturnSummary(user.getBusinessId(), dateFrom, dateTo, partyId, status));
    }

    @GetMapping("/sales-returns/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getSalesReturnReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) SalesReturnStatus status,
            @RequestParam(required = false) String search
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("returnDate").descending());
        var res = reportService.getSalesReturnReport(user.getBusinessId(), dateFrom, dateTo, partyId, status, search, all);
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generateSalesReturnReportPdf(res.getData(), res.getSummary(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "SalesReturnReport.pdf");
    }

    // =========================================================================
    // 9. PURCHASE RETURN REPORTS
    // =========================================================================

    @GetMapping("/purchase-returns")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ReportPageResponse<PurchaseReturnReportItemDTO, PurchaseReturnSummaryDTO>> getPurchaseReturnReport(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PurchaseReturnStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "returnDate,desc") String[] sort
    ) {
        Pageable pageable = createPageable(page, size, sort, "returnDate");
        return ResponseEntity.ok(reportService.getPurchaseReturnReport(
                user.getBusinessId(), dateFrom, dateTo, partyId, status, search, pageable
        ));
    }

    @GetMapping("/purchase-returns/summary")
    @PreAuthorize("hasAuthority('PURCHASE_RETURN_REPORT_VIEW') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<PurchaseReturnSummaryDTO> getPurchaseReturnSummary(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PurchaseReturnStatus status
    ) {
        return ResponseEntity.ok(reportService.getPurchaseReturnSummary(user.getBusinessId(), dateFrom, dateTo, partyId, status));
    }

    @GetMapping("/purchase-returns/pdf")
    @PreAuthorize("hasAuthority('REPORT_PDF') or hasAuthority('REPORT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> getPurchaseReturnReportPdf(
            @AuthenticationPrincipal UserPrincipal user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) Long partyId,
            @RequestParam(required = false) PurchaseReturnStatus status,
            @RequestParam(required = false) String search
    ) {
        Pageable all = PageRequest.of(0, 10000, Sort.by("returnDate").descending());
        var res = reportService.getPurchaseReturnReport(user.getBusinessId(), dateFrom, dateTo, partyId, status, search, all);
        String filterDesc = buildDateFilterDesc(dateFrom, dateTo);
        byte[] pdf = reportPdfService.generatePurchaseReturnReportPdf(res.getData(), res.getSummary(), filterDesc, user.getBusinessName());
        return createPdfResponse(pdf, "PurchaseReturnReport.pdf");
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    private Pageable createPageable(int page, int size, String[] sort, String defaultField) {
        String field = defaultField;
        Sort.Direction direction = Sort.Direction.DESC;
        if (sort != null && sort.length > 0) {
            String[] parts = sort[0].split(",");
            field = parts[0];
            if (parts.length > 1 && "asc".equalsIgnoreCase(parts[1])) {
                direction = Sort.Direction.ASC;
            }
        }
        return PageRequest.of(page, size, Sort.by(direction, field));
    }

    private String buildDateFilterDesc(LocalDate from, LocalDate to) {
        if (from != null && to != null) {
            return from.toString() + " to " + to.toString();
        } else if (from != null) {
            return "From " + from.toString();
        } else if (to != null) {
            return "Up to " + to.toString();
        }
        return "All Dates";
    }

    private ResponseEntity<byte[]> createPdfResponse(byte[] pdf, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }
}
