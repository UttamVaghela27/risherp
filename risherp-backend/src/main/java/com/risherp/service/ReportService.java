package com.risherp.service;

import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import com.risherp.dto.report.*;
import com.risherp.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    // 1. Sales Reports
    ReportPageResponse<SalesReportItemDTO, SalesSummaryDTO> getSalesReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, Long itemId, Long categoryId,
            PaymentStatus paymentStatus, SaleType saleType, SaleStatus status,
            String search, Pageable pageable
    );
    SalesSummaryDTO getSalesSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, SaleStatus status);
    List<ItemWiseSalesDTO> getItemWiseSales(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId, String search);
    List<PartyWiseSalesDTO> getPartyWiseSales(Long businessId, LocalDate dateFrom, LocalDate dateTo, String search);
    List<DailySalesDTO> getDailySales(Long businessId, LocalDate dateFrom, LocalDate dateTo);

    // 2. Purchase Reports
    ReportPageResponse<PurchaseReportItemDTO, PurchaseSummaryDTO> getPurchaseReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long supplierId, Long itemId, Long categoryId,
            PaymentStatus paymentStatus, PurchaseType purchaseType, PurchaseStatus status,
            String search, Pageable pageable
    );
    PurchaseSummaryDTO getPurchaseSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long supplierId, PurchaseStatus status);
    List<ItemWisePurchaseDTO> getItemWisePurchases(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId, String search);
    List<SupplierWisePurchaseDTO> getSupplierWisePurchases(Long businessId, LocalDate dateFrom, LocalDate dateTo, String search);

    // 3. Stock Reports
    ReportPageResponse<StockReportItemDTO, StockSummaryDTO> getStockReport(
            Long businessId, Long categoryId, StockStatus stockStatus,
            String search, Pageable pageable
    );
    StockSummaryDTO getStockSummary(Long businessId);
    Page<StockMovementDTO> getStockMovement(
            Long businessId, Long itemId, LocalDate dateFrom, LocalDate dateTo,
            String transactionType, String referenceType, String search, Pageable pageable
    );
    List<LowStockDTO> getLowStockReport(Long businessId, Long categoryId, String search);

    // 4. Profit Report
    ProfitSummaryDTO getProfitSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId);
    List<ItemWiseProfitDTO> getItemWiseProfit(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId, String search);

    // 5. Outstanding Reports (Reusing Phase 15 Outstanding Service)
    Page<CustomerOutstandingDTO> getCustomerOutstandingReport(
            Long businessId, String search, LocalDate dateFrom, LocalDate dateTo, Pageable pageable
    );
    Page<SupplierOutstandingDTO> getSupplierOutstandingReport(
            Long businessId, String search, LocalDate dateFrom, LocalDate dateTo, Pageable pageable
    );

    // 6. Receipts Report
    ReportPageResponse<ReceiptReportItemDTO, ReceiptSummaryDTO> getReceiptReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, PaymentMode paymentMode, ReceiptStatus status,
            String search, Pageable pageable
    );
    ReceiptSummaryDTO getReceiptSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, ReceiptStatus status);

    // 7. Payments Report
    ReportPageResponse<PaymentReportItemDTO, PaymentSummaryDTO> getPaymentReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, PaymentMode paymentMode, PaymentTxnStatus status,
            String search, Pageable pageable
    );
    PaymentSummaryDTO getPaymentSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, PaymentTxnStatus status);

    // 8. Sales Return Report
    ReportPageResponse<SalesReturnReportItemDTO, SalesReturnSummaryDTO> getSalesReturnReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, SalesReturnStatus status,
            String search, Pageable pageable
    );
    SalesReturnSummaryDTO getSalesReturnSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, SalesReturnStatus status);

    // 9. Purchase Return Report
    ReportPageResponse<PurchaseReturnReportItemDTO, PurchaseReturnSummaryDTO> getPurchaseReturnReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, PurchaseReturnStatus status,
            String search, Pageable pageable
    );
    PurchaseReturnSummaryDTO getPurchaseReturnSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, PurchaseReturnStatus status);
}
