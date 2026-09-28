package com.risherp.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.Element;
import com.risherp.entity.Business;
import com.risherp.entity.Party;
import com.risherp.entity.SalesReturn;
import com.risherp.entity.SalesReturnItem;
import com.risherp.entity.Sale;
import com.risherp.service.SalesReturnPdfService;
import com.risherp.util.PdfComponents;
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
public class SalesReturnPdfServiceImpl implements SalesReturnPdfService {

    @Override
    public byte[] generateSalesReturnPdf(SalesReturn sr) {
        log.info("Generating PDF for sales return: {}", sr.getReturnNumber());

        Document document = new Document(PageSize.A4, 36, 36, 36, 120);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            Business biz = sr.getBusiness();
            Sale sale = sr.getSale();

            String bizName = (biz != null && biz.getBusinessName() != null) ? biz.getBusinessName() : "RISHERP Business";
            String bizEmail = (biz != null && biz.getEmail() != null) ? biz.getEmail() : "";
            String bizMobile = (biz != null && biz.getMobile() != null) ? biz.getMobile() : "";

            String bizAddress = "";
            if (biz != null && biz.getAddress() != null && !biz.getAddress().isBlank()) {
                bizAddress = biz.getAddress();
                if (biz.getCity() != null) bizAddress += ", " + biz.getCity();
                if (biz.getState() != null) bizAddress += ", " + biz.getState();
                if (biz.getPincode() != null) bizAddress += " - " + biz.getPincode();
            }

            Map<String, String> metaFields = new LinkedHashMap<>();
            if (sale != null) {
                metaFields.put("Against Invoice", sale.getInvoiceNumber());
                if (sale.getSaleDate() != null) {
                    metaFields.put("Invoice Date", sale.getSaleDate().format(PdfComponents.DATE_FORMAT));
                }
            }
            if (sr.getRefundMode() != null) {
                metaFields.put("Refund Mode", sr.getRefundMode().toString().replace('_', ' '));
            }
            if (sr.getReason() != null && !sr.getReason().isBlank()) {
                metaFields.put("Reason", sr.getReason());
            }

            String dateStr = sr.getReturnDate() != null ? sr.getReturnDate().format(PdfComponents.DATE_FORMAT) : "—";
            document.add(PdfComponents.createDocumentHeader(
                    bizName, bizEmail, bizMobile, bizAddress,
                    "SALES RETURN / CREDIT NOTE", sr.getReturnNumber(), dateStr, metaFields
            ));

            PdfComponents.addSeparator(document);

            Party party = sr.getParty();
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

            String[] headers = {"#", "ITEM DESCRIPTION", "ORIGINAL QTY", "RETURN QTY", "UNIT", "RATE", "AMOUNT"};
            float[] widths = {6f, 34f, 13f, 13f, 9f, 11f, 14f};
            int[] aligns = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_CENTER, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};

            List<String[]> rows = new ArrayList<>();
            int index = 1;
            for (SalesReturnItem item : sr.getReturnItems()) {
                String itemName = item.getItemNameSnapshot();
                if (item.getItemCodeSnapshot() != null && !item.getItemCodeSnapshot().isEmpty()) {
                    itemName += "\nCode: " + item.getItemCodeSnapshot();
                }
                
                rows.add(new String[]{
                        String.valueOf(index++),
                        itemName,
                        PdfComponents.QTY_FORMAT.format(item.getOriginalQuantity()),
                        PdfComponents.QTY_FORMAT.format(item.getReturnQuantity()),
                        item.getUnitSnapshot() != null ? item.getUnitSnapshot() : "PCS",
                        PdfComponents.CURRENCY_FORMAT.format(item.getRate()),
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
            if (sr.getNotes() != null && !sr.getNotes().trim().isEmpty()) {
                notesCell.addElement(new Paragraph("NOTES:", PdfComponents.SMALL_FONT));
                notesCell.addElement(new Paragraph(sr.getNotes(), PdfComponents.SMALL_FONT));
            }
            summaryTable.addCell(notesCell);

            PdfPTable calcTable = new PdfPTable(2);
            calcTable.setWidthPercentage(100);
            calcTable.setWidths(new float[]{50f, 50f});

            PdfComponents.addSummaryRow(calcTable, "Subtotal:", PdfComponents.CURRENCY_FORMAT.format(sr.getSubtotal()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);

            if (sr.getItemDiscount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Item Discount:", "-" + PdfComponents.CURRENCY_FORMAT.format(sr.getItemDiscount()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }
            if (sr.getOverallDiscountAllocated().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Overall Discount (Allocated):", "-" + PdfComponents.CURRENCY_FORMAT.format(sr.getOverallDiscountAllocated()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }

            PdfComponents.addSummaryRow(calcTable, "REFUND / RETURN AMOUNT", PdfComponents.CURRENCY_FORMAT.format(sr.getReturnAmount()), 
                    PdfComponents.GRAND_TOTAL_LABEL_FONT, PdfComponents.GRAND_TOTAL_VAL_FONT, 
                    Rectangle.TOP | Rectangle.BOTTOM, PdfComponents.BORDER_COLOR);

            PdfPCell calcCell = new PdfPCell(calcTable);
            calcCell.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(calcCell);

            document.add(summaryTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            PdfPTable footer = PdfComponents.createDocumentFooter(null, null, "Generated by RISHERP Enterprise Billing", "Office Copy");
            PdfComponents.drawFooterAtBottom(writer, document, footer);
            document.close();
            
            log.info("Sales return PDF generated successfully for {}", sr.getReturnNumber());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for sales return {}: {}", sr.getReturnNumber(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
}
