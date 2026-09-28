package com.risherp.service;

import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import com.risherp.dto.report.*;

import java.util.List;

public interface ReportPdfService {

    byte[] generateSalesReportPdf(List<SalesReportItemDTO> items, SalesSummaryDTO summary, String filterDescription, String businessName);

    byte[] generatePurchaseReportPdf(List<PurchaseReportItemDTO> items, PurchaseSummaryDTO summary, String filterDescription, String businessName);

    byte[] generateStockReportPdf(List<StockReportItemDTO> items, StockSummaryDTO summary, String filterDescription, String businessName);

    byte[] generateProfitReportPdf(List<ItemWiseProfitDTO> items, ProfitSummaryDTO summary, String filterDescription, String businessName);

    byte[] generateCustomerOutstandingPdf(List<CustomerOutstandingDTO> items, String filterDescription, String businessName);

    byte[] generateSupplierOutstandingPdf(List<SupplierOutstandingDTO> items, String filterDescription, String businessName);

    byte[] generateReceiptReportPdf(List<ReceiptReportItemDTO> items, ReceiptSummaryDTO summary, String filterDescription, String businessName);

    byte[] generatePaymentReportPdf(List<PaymentReportItemDTO> items, PaymentSummaryDTO summary, String filterDescription, String businessName);

    byte[] generateSalesReturnReportPdf(List<SalesReturnReportItemDTO> items, SalesReturnSummaryDTO summary, String filterDescription, String businessName);

    byte[] generatePurchaseReturnReportPdf(List<PurchaseReturnReportItemDTO> items, PurchaseReturnSummaryDTO summary, String filterDescription, String businessName);
}
