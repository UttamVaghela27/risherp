package com.risherp.service.impl;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import com.risherp.dto.report.*;
import com.risherp.service.ReportPdfService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
public class ReportPdfServiceImpl implements ReportPdfService {

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("₹ #,##0.00");
    private static final DecimalFormat QTY_FORMAT = new DecimalFormat("#,##0.###");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    // Colors matching RISHERP enterprise theme
    private static final Color PRIMARY_COLOR = new Color(30, 58, 138);     // #1E3A8A Navy
    private static final Color SECONDARY_COLOR = new Color(71, 85, 105);   // #475569 Slate
    private static final Color HEADER_BG = new Color(241, 245, 249);       // #F1F5F9 Light Slate
    private static final Color ROW_ALT_BG = new Color(248, 250, 252);     // #F8FAFC
    private static final Color BORDER_COLOR = new Color(226, 232, 240);    // #E2E8F0

    private static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, PRIMARY_COLOR);
    private static final Font SUBTITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, SECONDARY_COLOR);
    private static final Font META_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);
    private static final Font TH_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);
    private static final Font TD_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.DARK_GRAY);
    private static final Font TD_BOLD_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.BLACK);

    // =========================================================================
    // 1. SALES REPORT PDF
    // =========================================================================

    @Override
    public byte[] generateSalesReportPdf(List<SalesReportItemDTO> items, SalesSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "SALES REPORT", businessName, filterDescription);

            // KPI Summary
            if (summary != null) {
                PdfPTable kpi = new PdfPTable(6);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(10);
                addKpiCell(kpi, "Total Invoices", String.valueOf(summary.getTotalInvoices()));
                addKpiCell(kpi, "Total Sales", formatCurrency(summary.getTotalSales()));
                addKpiCell(kpi, "Total Discount", formatCurrency(summary.getTotalDiscount()));
                addKpiCell(kpi, "Total Paid", formatCurrency(summary.getTotalPaid()));
                addKpiCell(kpi, "Total Outstanding", formatCurrency(summary.getTotalOutstanding()));
                addKpiCell(kpi, "Avg Invoice", formatCurrency(summary.getAverageInvoiceValue()));
                document.add(kpi);
            }

            // Data Table
            PdfPTable table = new PdfPTable(new float[]{3.5f, 2.5f, 5.0f, 2.5f, 2.5f, 2.5f, 2.5f, 2.5f, 2.5f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Invoice #", "Date", "Customer", "Type", "Subtotal", "Discount", "Grand Total", "Paid", "Balance", "Status"});

            boolean alt = false;
            for (SalesReportItemDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getInvoiceNumber(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getSaleDate() != null ? item.getSaleDate().format(DATE_FORMAT) : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getSaleType() != null ? item.getSaleType().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, formatCurrency(item.getSubtotal()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getDiscountAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getGrandTotal()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, formatCurrency(item.getPaidAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getBalanceAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, item.getStatus() != null ? item.getStatus().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating sales report PDF", e);
            throw new RuntimeException("Failed to generate Sales Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 2. PURCHASE REPORT PDF
    // =========================================================================

    @Override
    public byte[] generatePurchaseReportPdf(List<PurchaseReportItemDTO> items, PurchaseSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "PURCHASE REPORT", businessName, filterDescription);

            if (summary != null) {
                PdfPTable kpi = new PdfPTable(6);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(10);
                addKpiCell(kpi, "Total Purchases", String.valueOf(summary.getTotalPurchases()));
                addKpiCell(kpi, "Total Amount", formatCurrency(summary.getTotalAmount()));
                addKpiCell(kpi, "Total Discount", formatCurrency(summary.getTotalDiscount()));
                addKpiCell(kpi, "Total Paid", formatCurrency(summary.getTotalPaid()));
                addKpiCell(kpi, "Total Payable", formatCurrency(summary.getTotalPayable()));
                addKpiCell(kpi, "Avg Purchase", formatCurrency(summary.getAveragePurchaseValue()));
                document.add(kpi);
            }

            PdfPTable table = new PdfPTable(new float[]{3.5f, 2.5f, 5.0f, 2.5f, 2.5f, 2.5f, 2.5f, 2.5f, 2.5f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Purchase #", "Date", "Supplier", "Type", "Subtotal", "Discount", "Grand Total", "Paid", "Balance", "Status"});

            boolean alt = false;
            for (PurchaseReportItemDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getPurchaseNumber(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getPurchaseDate() != null ? item.getPurchaseDate().format(DATE_FORMAT) : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getPurchaseType() != null ? item.getPurchaseType().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, formatCurrency(item.getSubtotal()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getDiscountAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getGrandTotal()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, formatCurrency(item.getPaidAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getBalanceAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, item.getStatus() != null ? item.getStatus().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating purchase report PDF", e);
            throw new RuntimeException("Failed to generate Purchase Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 3. STOCK REPORT PDF
    // =========================================================================

    @Override
    public byte[] generateStockReportPdf(List<StockReportItemDTO> items, StockSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "STOCK REPORT & VALUATION", businessName, filterDescription);

            if (summary != null) {
                PdfPTable kpi = new PdfPTable(5);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(10);
                addKpiCell(kpi, "Total Items", String.valueOf(summary.getTotalItems()));
                addKpiCell(kpi, "Total Stock Qty", QTY_FORMAT.format(summary.getTotalStockQuantity()));
                addKpiCell(kpi, "Total Stock Value", formatCurrency(summary.getTotalStockValue()));
                addKpiCell(kpi, "Low Stock Items", String.valueOf(summary.getLowStockItems()));
                addKpiCell(kpi, "Out of Stock Items", String.valueOf(summary.getOutOfStockItems()));
                document.add(kpi);
            }

            PdfPTable table = new PdfPTable(new float[]{3.0f, 6.0f, 3.5f, 2.0f, 2.5f, 2.5f, 2.5f, 2.5f, 3.0f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Item Code", "Item Name", "Category", "Unit", "Current Stock", "Min Stock", "Purchase Rate", "Sale Rate", "Stock Value", "Status"});

            boolean alt = false;
            for (StockReportItemDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getItemCode(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getItemName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getCategoryName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getUnit(), Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, QTY_FORMAT.format(item.getCurrentStock()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, QTY_FORMAT.format(item.getMinimumStock()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getPurchaseRate()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getSaleRate()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getStockValue()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, item.getStockStatus() != null ? item.getStockStatus().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating stock report PDF", e);
            throw new RuntimeException("Failed to generate Stock Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 4. PROFIT REPORT PDF
    // =========================================================================

    @Override
    public byte[] generateProfitReportPdf(List<ItemWiseProfitDTO> items, ProfitSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "GROSS PROFIT & MARGIN REPORT", businessName, filterDescription);

            if (summary != null) {
                PdfPTable kpi = new PdfPTable(6);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(6);
                addKpiCell(kpi, "Gross Sales", formatCurrency(summary.getGrossSales()));
                addKpiCell(kpi, "Sales Discount", formatCurrency(summary.getSalesDiscount()));
                addKpiCell(kpi, "Net Sales", formatCurrency(summary.getNetSales()));
                addKpiCell(kpi, "COGS (Cost)", formatCurrency(summary.getCostOfGoodsSold()));
                addKpiCell(kpi, "Gross Profit", formatCurrency(summary.getGrossProfit()));
                addKpiCell(kpi, "Gross Margin %", summary.getGrossMarginPercentage() + "%");
                document.add(kpi);

                Paragraph note = new Paragraph("Methodology Note: " + summary.getMethodologyNote(), META_FONT);
                note.setSpacingAfter(10);
                document.add(note);
            }

            PdfPTable table = new PdfPTable(new float[]{3.0f, 6.0f, 3.5f, 2.5f, 3.0f, 2.5f, 3.0f, 3.0f, 3.0f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Item Code", "Item Name", "Category", "Qty Sold", "Gross Sales", "Discount", "Net Sales", "COGS (Cost)", "Gross Profit", "Margin %"});

            boolean alt = false;
            for (ItemWiseProfitDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getItemCode(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getItemName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getCategoryName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, QTY_FORMAT.format(item.getQuantitySold()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getGrossSales()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getDiscount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getNetSales()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getTotalCost()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getGrossProfit()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, item.getMarginPercentage() + "%", Element.ALIGN_RIGHT, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating profit report PDF", e);
            throw new RuntimeException("Failed to generate Profit Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 5. OUTSTANDING PDFS
    // =========================================================================

    @Override
    public byte[] generateCustomerOutstandingPdf(List<CustomerOutstandingDTO> items, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4, 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "CUSTOMER OUTSTANDING REPORT", businessName, filterDescription);

            PdfPTable table = new PdfPTable(new float[]{5.0f, 3.0f, 3.0f, 3.0f, 3.0f, 3.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Customer", "Opening Bal", "Sales (+)", "Receipts (-)", "Returns (-)", "Net Outstanding"});

            boolean alt = false;
            for (CustomerOutstandingDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, formatCurrency(item.getOpeningBalance()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getTotalSales()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getTotalReceipts()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getTotalSalesReturns()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getOutstanding()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating customer outstanding PDF", e);
            throw new RuntimeException("Failed to generate Customer Outstanding PDF", e);
        }
        return out.toByteArray();
    }

    @Override
    public byte[] generateSupplierOutstandingPdf(List<SupplierOutstandingDTO> items, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4, 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "SUPPLIER OUTSTANDING REPORT", businessName, filterDescription);

            PdfPTable table = new PdfPTable(new float[]{5.0f, 3.0f, 3.0f, 3.0f, 3.0f, 3.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Supplier", "Opening Bal", "Purchases (+)", "Payments (-)", "Returns (-)", "Net Outstanding"});

            boolean alt = false;
            for (SupplierOutstandingDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, formatCurrency(item.getOpeningBalance()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getTotalPurchases()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getTotalPayments()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getTotalPurchaseReturns()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getOutstanding()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating supplier outstanding PDF", e);
            throw new RuntimeException("Failed to generate Supplier Outstanding PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 6. RECEIPT REPORT PDF
    // =========================================================================

    @Override
    public byte[] generateReceiptReportPdf(List<ReceiptReportItemDTO> items, ReceiptSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "RECEIPT REPORT", businessName, filterDescription);

            if (summary != null) {
                PdfPTable kpi = new PdfPTable(6);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(10);
                addKpiCell(kpi, "Total Receipts", String.valueOf(summary.getTotalReceipts()));
                addKpiCell(kpi, "Total Collected", formatCurrency(summary.getTotalAmount()));
                addKpiCell(kpi, "Cash", formatCurrency(summary.getCashAmount()));
                addKpiCell(kpi, "Bank Transfer", formatCurrency(summary.getBankAmount()));
                addKpiCell(kpi, "UPI", formatCurrency(summary.getUpiAmount()));
                addKpiCell(kpi, "Allocated", formatCurrency(summary.getAllocatedAmount()));
                document.add(kpi);
            }

            PdfPTable table = new PdfPTable(new float[]{3.5f, 2.5f, 5.0f, 3.0f, 3.0f, 3.0f, 3.0f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Receipt #", "Date", "Customer", "Amount", "Mode", "Allocated", "Unallocated", "Status"});

            boolean alt = false;
            for (ReceiptReportItemDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getReceiptNumber(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getReceiptDate() != null ? item.getReceiptDate().format(DATE_FORMAT) : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getAmount()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, item.getPaymentMode() != null ? item.getPaymentMode().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, formatCurrency(item.getAllocatedAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getUnallocatedAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, item.getStatus() != null ? item.getStatus().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating receipt report PDF", e);
            throw new RuntimeException("Failed to generate Receipt Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 7. PAYMENT REPORT PDF
    // =========================================================================

    @Override
    public byte[] generatePaymentReportPdf(List<PaymentReportItemDTO> items, PaymentSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "PAYMENT REPORT", businessName, filterDescription);

            if (summary != null) {
                PdfPTable kpi = new PdfPTable(6);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(10);
                addKpiCell(kpi, "Total Payments", String.valueOf(summary.getTotalPayments()));
                addKpiCell(kpi, "Total Paid", formatCurrency(summary.getTotalAmount()));
                addKpiCell(kpi, "Cash", formatCurrency(summary.getCashAmount()));
                addKpiCell(kpi, "Bank Transfer", formatCurrency(summary.getBankAmount()));
                addKpiCell(kpi, "UPI", formatCurrency(summary.getUpiAmount()));
                addKpiCell(kpi, "Allocated", formatCurrency(summary.getAllocatedAmount()));
                document.add(kpi);
            }

            PdfPTable table = new PdfPTable(new float[]{3.5f, 2.5f, 5.0f, 3.0f, 3.0f, 3.0f, 3.0f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Payment #", "Date", "Supplier", "Amount", "Mode", "Allocated", "Unallocated", "Status"});

            boolean alt = false;
            for (PaymentReportItemDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getPaymentNumber(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getPaymentDate() != null ? item.getPaymentDate().format(DATE_FORMAT) : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getAmount()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, item.getPaymentMode() != null ? item.getPaymentMode().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, formatCurrency(item.getAllocatedAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getUnallocatedAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, item.getStatus() != null ? item.getStatus().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating payment report PDF", e);
            throw new RuntimeException("Failed to generate Payment Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 8. SALES RETURN REPORT PDF
    // =========================================================================

    @Override
    public byte[] generateSalesReturnReportPdf(List<SalesReturnReportItemDTO> items, SalesReturnSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "SALES RETURN REPORT", businessName, filterDescription);

            if (summary != null) {
                PdfPTable kpi = new PdfPTable(4);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(10);
                addKpiCell(kpi, "Total Returns", String.valueOf(summary.getTotalReturns()));
                addKpiCell(kpi, "Total Return Amount", formatCurrency(summary.getTotalReturnAmount()));
                addKpiCell(kpi, "Total Refund", formatCurrency(summary.getTotalRefundAmount()));
                addKpiCell(kpi, "Total Adjustment", formatCurrency(summary.getTotalAdjustmentAmount()));
                document.add(kpi);
            }

            PdfPTable table = new PdfPTable(new float[]{3.5f, 2.5f, 3.5f, 5.0f, 3.0f, 3.0f, 3.0f, 3.5f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Return #", "Date", "Invoice #", "Customer", "Return Amount", "Refund", "Adjustment", "Reason", "Status"});

            boolean alt = false;
            for (SalesReturnReportItemDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getReturnNumber(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getReturnDate() != null ? item.getReturnDate().format(DATE_FORMAT) : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, item.getInvoiceNumber(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getReturnAmount()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, formatCurrency(item.getRefundAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getAdjustmentAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, item.getReason() != null ? item.getReason() : "-", Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getStatus() != null ? item.getStatus().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating sales return report PDF", e);
            throw new RuntimeException("Failed to generate Sales Return Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // 9. PURCHASE RETURN REPORT PDF
    // =========================================================================

    @Override
    public byte[] generatePurchaseReturnReportPdf(List<PurchaseReturnReportItemDTO> items, PurchaseReturnSummaryDTO summary, String filterDescription, String businessName) {
        Document document = new Document(PageSize.A4.rotate(), 20, 20, 20, 20);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new ReportFooterEvent());
            document.open();

            addHeader(document, "PURCHASE RETURN REPORT", businessName, filterDescription);

            if (summary != null) {
                PdfPTable kpi = new PdfPTable(4);
                kpi.setWidthPercentage(100);
                kpi.setSpacingAfter(10);
                addKpiCell(kpi, "Total Returns", String.valueOf(summary.getTotalReturns()));
                addKpiCell(kpi, "Total Return Amount", formatCurrency(summary.getTotalReturnAmount()));
                addKpiCell(kpi, "Total Refund", formatCurrency(summary.getTotalRefundAmount()));
                addKpiCell(kpi, "Total Adjustment", formatCurrency(summary.getTotalAdjustmentAmount()));
                document.add(kpi);
            }

            PdfPTable table = new PdfPTable(new float[]{3.5f, 2.5f, 3.5f, 5.0f, 3.0f, 3.0f, 3.0f, 3.5f, 2.5f});
            table.setWidthPercentage(100);

            addTableHeader(table, new String[]{"Return #", "Date", "Purchase #", "Supplier", "Return Amount", "Refund", "Adjustment", "Reason", "Status"});

            boolean alt = false;
            for (PurchaseReturnReportItemDTO item : items) {
                Color bg = alt ? ROW_ALT_BG : Color.WHITE;
                addCell(table, item.getReturnNumber(), Element.ALIGN_LEFT, bg, TD_BOLD_FONT);
                addCell(table, item.getReturnDate() != null ? item.getReturnDate().format(DATE_FORMAT) : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                addCell(table, item.getPurchaseNumber(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getPartyName(), Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getReturnAmount()), Element.ALIGN_RIGHT, bg, TD_BOLD_FONT);
                addCell(table, formatCurrency(item.getRefundAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, formatCurrency(item.getAdjustmentAmount()), Element.ALIGN_RIGHT, bg, TD_FONT);
                addCell(table, item.getReason() != null ? item.getReason() : "-", Element.ALIGN_LEFT, bg, TD_FONT);
                addCell(table, item.getStatus() != null ? item.getStatus().name() : "-", Element.ALIGN_CENTER, bg, TD_FONT);
                alt = !alt;
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            log.error("Error generating purchase return report PDF", e);
            throw new RuntimeException("Failed to generate Purchase Return Report PDF", e);
        }
        return out.toByteArray();
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private void addHeader(Document doc, String reportTitle, String businessName, String filterDescription) throws DocumentException {
        PdfPTable header = new PdfPTable(2);
        header.setWidthPercentage(100);
        header.setWidths(new float[]{6, 4});
        header.setSpacingAfter(8);

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.addElement(new Paragraph(businessName != null ? businessName : "RISHERP Enterprise", TITLE_FONT));
        leftCell.addElement(new Paragraph(reportTitle, SUBTITLE_FONT));

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph genMeta = new Paragraph("Generated: " + LocalDateTime.now().format(DATETIME_FORMAT), META_FONT);
        genMeta.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(genMeta);

        if (filterDescription != null && !filterDescription.isEmpty()) {
            Paragraph fMeta = new Paragraph("Filters: " + filterDescription, META_FONT);
            fMeta.setAlignment(Element.ALIGN_RIGHT);
            rightCell.addElement(fMeta);
        }

        header.addCell(leftCell);
        header.addCell(rightCell);
        doc.add(header);

        LineSeparator ls = new LineSeparator();
        ls.setLineColor(PRIMARY_COLOR);
        ls.setLineWidth(1.5f);
        doc.add(ls);
        doc.add(new Paragraph(" "));
    }

    private void addTableHeader(PdfPTable table, String[] headers) {
        table.setHeaderRows(1);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, TH_FONT));
            cell.setBackgroundColor(PRIMARY_COLOR);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            cell.setPadding(5);
            cell.setBorderColor(PRIMARY_COLOR);
            table.addCell(cell);
        }
    }

    private void addCell(PdfPTable table, String text, int align, Color bg, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBackgroundColor(bg);
        cell.setBorderColor(BORDER_COLOR);
        cell.setPadding(4);
        table.addCell(cell);
    }

    private void addKpiCell(PdfPTable table, String label, String value) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(HEADER_BG);
        cell.setBorderColor(BORDER_COLOR);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph pLabel = new Paragraph(label, META_FONT);
        pLabel.setAlignment(Element.ALIGN_CENTER);
        Paragraph pVal = new Paragraph(value, TD_BOLD_FONT);
        pVal.setAlignment(Element.ALIGN_CENTER);

        cell.addElement(pLabel);
        cell.addElement(pVal);
        table.addCell(cell);
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "₹ 0.00";
        return CURRENCY_FORMAT.format(amount);
    }

    /**
     * Page numbering footer
     */
    private static class ReportFooterEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfPTable footer = new PdfPTable(1);
            footer.setTotalWidth(document.right() - document.left());
            PdfPCell cell = new PdfPCell(new Phrase("RISHERP Reporting System | Page " + writer.getPageNumber(), META_FONT));
            cell.setBorder(Rectangle.NO_BORDER);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            footer.addCell(cell);
            footer.writeSelectedRows(0, -1, document.left(), document.bottom() - 5, writer.getDirectContent());
        }
    }
}
