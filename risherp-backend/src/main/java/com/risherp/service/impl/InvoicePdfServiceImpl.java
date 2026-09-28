package com.risherp.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.Phrase;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.Element;
import com.risherp.entity.Business;
import com.risherp.entity.Party;
import com.risherp.entity.Sale;
import com.risherp.entity.SaleItem;
import com.risherp.service.InvoicePdfService;
import com.risherp.service.SettingsService;
import com.risherp.dto.settings.InvoiceSettingsDto;
import com.risherp.util.PdfComponents;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoicePdfServiceImpl implements InvoicePdfService {

    private final SettingsService settingsService;

    @Override
    public byte[] generateInvoicePdf(Sale sale) {
        log.info("Generating PDF for invoice: {}", sale.getInvoiceNumber());

        Document document = new Document(PageSize.A4, 36, 36, 36, 120);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            Business biz = sale.getBusiness();
            InvoiceSettingsDto invSettings = (biz != null && biz.getId() != null) ? settingsService.getInvoiceSettings(biz.getId()) : null;

            String bizName = (biz != null && biz.getBusinessName() != null) ? biz.getBusinessName() : "RISHERP Business";
            String bizEmail = (biz != null && biz.getEmail() != null) ? biz.getEmail() : "";
            String bizMobile = (biz != null && biz.getMobile() != null) ? biz.getMobile() : "";
            String invoiceTitle = (invSettings != null && invSettings.getInvoiceTitle() != null && !invSettings.getInvoiceTitle().isBlank())
                    ? invSettings.getInvoiceTitle() : "TAX INVOICE";

            String bizAddress = "";
            if (invSettings == null || Boolean.TRUE.equals(invSettings.getShowBusinessAddress())) {
                if (biz != null && biz.getAddress() != null && !biz.getAddress().isBlank()) {
                    bizAddress = biz.getAddress();
                    if (biz.getCity() != null) bizAddress += ", " + biz.getCity();
                    if (biz.getState() != null) bizAddress += ", " + biz.getState();
                    if (biz.getPincode() != null) bizAddress += " - " + biz.getPincode();
                }
            }

            Map<String, String> metaFields = new LinkedHashMap<>();
            metaFields.put("Type", sale.getSaleType() != null ? sale.getSaleType().name() : "CASH");
            metaFields.put("Payment", sale.getPaymentStatus() != null ? sale.getPaymentStatus().name() : "PENDING");
            if (sale.getPaymentMode() != null) {
                metaFields.put("Payment Mode", sale.getPaymentMode().name());
            }

            String dateStr = sale.getSaleDate() != null ? sale.getSaleDate().format(PdfComponents.DATE_FORMAT) : "—";
            document.add(PdfComponents.createDocumentHeader(
                    bizName, bizEmail, bizMobile, bizAddress,
                    invoiceTitle, sale.getInvoiceNumber(), dateStr, metaFields
            ));

            PdfComponents.addSeparator(document);

            Party party = sale.getParty();
            String partyName = party != null ? party.getPartyName() : "Cash Customer";
            String partyCode = party != null ? party.getPartyCode() : "";
            String partyPhone = party != null ? party.getMobile() : "";
            String partyEmail = party != null ? party.getEmail() : "";
            
            StringBuilder addrBuilder = new StringBuilder();
            if (party != null) {
                if (party.getAddress() != null) addrBuilder.append(party.getAddress());
                if (party.getCity() != null) addrBuilder.append(", ").append(party.getCity());
                if (party.getState() != null) addrBuilder.append(", ").append(party.getState());
                if (party.getPincode() != null) addrBuilder.append(" - ").append(party.getPincode());
            }

            document.add(PdfComponents.createPartyInformation(
                    "BILL TO (CUSTOMER):", partyName, partyCode, partyPhone, partyEmail, addrBuilder.toString()
            ));

            document.add(new Paragraph(" "));

            String[] headers = {"#", "ITEM DESCRIPTION", "QTY", "UNIT", "RATE", "DISCOUNT", "AMOUNT"};
            float[] widths = {6f, 38f, 10f, 10f, 12f, 11f, 13f};
            int[] aligns = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};

            List<String[]> rows = new ArrayList<>();
            int index = 1;
            for (SaleItem item : sale.getSaleItems()) {
                String itemName = item.getItemNameSnapshot();
                if (item.getItemCodeSnapshot() != null && !item.getItemCodeSnapshot().isEmpty()) {
                    itemName += "\nCode: " + item.getItemCodeSnapshot();
                }
                String discStr = item.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0
                        ? "-" + PdfComponents.CURRENCY_FORMAT.format(item.getDiscountAmount()) : "—";
                
                rows.add(new String[]{
                        String.valueOf(index++),
                        itemName,
                        PdfComponents.QTY_FORMAT.format(item.getQuantity()),
                        item.getUnitSnapshot() != null ? item.getUnitSnapshot() : "PCS",
                        PdfComponents.CURRENCY_FORMAT.format(item.getRate()),
                        discStr,
                        PdfComponents.CURRENCY_FORMAT.format(item.getLineTotal())
                });
            }

            document.add(PdfComponents.createItemsTable(headers, widths, aligns, rows));
            document.add(new Paragraph(" "));

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{55f, 45f});

            PdfPCell notesCell = new PdfPCell();
            notesCell.setBorder(Rectangle.NO_BORDER);
            notesCell.setPadding(6f);
            if (sale.getNotes() != null && !sale.getNotes().trim().isEmpty()) {
                notesCell.addElement(new Paragraph("NOTES & TERMS:", PdfComponents.SMALL_FONT));
                notesCell.addElement(new Paragraph(sale.getNotes(), PdfComponents.SMALL_FONT));
            }
            summaryTable.addCell(notesCell);

            PdfPTable calcTable = new PdfPTable(2);
            calcTable.setWidthPercentage(100);
            calcTable.setWidths(new float[]{50f, 50f});

            PdfComponents.addSummaryRow(calcTable, "Subtotal:", PdfComponents.CURRENCY_FORMAT.format(sale.getSubtotal()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);

            if (sale.getItemDiscount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Item Discount:", "-" + PdfComponents.CURRENCY_FORMAT.format(sale.getItemDiscount()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }
            if (sale.getOverallDiscount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Overall Discount:", "-" + PdfComponents.CURRENCY_FORMAT.format(sale.getOverallDiscount()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }
            if (sale.getTotalDiscount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Total Discount:", "-" + PdfComponents.CURRENCY_FORMAT.format(sale.getTotalDiscount()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }

            PdfComponents.addSummaryRow(calcTable, "Grand Total:", PdfComponents.CURRENCY_FORMAT.format(sale.getGrandTotal()), 
                    PdfComponents.GRAND_TOTAL_LABEL_FONT, PdfComponents.GRAND_TOTAL_VAL_FONT, 
                    Rectangle.TOP | Rectangle.BOTTOM, PdfComponents.BORDER_COLOR);

            PdfComponents.addSummaryRow(calcTable, "Paid Amount:", PdfComponents.CURRENCY_FORMAT.format(sale.getPaidAmount()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);

            String balLabel = "Balance Due:";
            String balValue = "₹ 0.00";
            if (sale.getBalanceAmount().compareTo(BigDecimal.ZERO) > 0) {
                balValue = PdfComponents.CURRENCY_FORMAT.format(sale.getBalanceAmount());
            }
            PdfComponents.addSummaryRow(calcTable, balLabel, balValue, PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);

            PdfPCell calcCell = new PdfPCell(calcTable);
            calcCell.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(calcCell);

            document.add(summaryTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            String terms = (invSettings != null && invSettings.getDefaultInvoiceTerms() != null && !invSettings.getDefaultInvoiceTerms().isBlank())
                    ? invSettings.getDefaultInvoiceTerms() : "Thank you for your business!";
            
            String footerText = (invSettings != null && invSettings.getInvoiceFooter() != null && !invSettings.getInvoiceFooter().isBlank())
                    ? invSettings.getInvoiceFooter() : "Generated by RISHERP Enterprise Billing";

            PdfPTable footer = PdfComponents.createDocumentFooter(terms, null, footerText, "Authorised Signatory");
            PdfComponents.drawFooterAtBottom(writer, document, footer);
            document.close();
            
            log.info("Invoice PDF generated successfully for {}", sale.getInvoiceNumber());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for invoice {}: {}", sale.getInvoiceNumber(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
}
