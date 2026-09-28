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
import com.risherp.entity.Receipt;
import com.risherp.entity.ReceiptAllocation;
import com.risherp.entity.Sale;
import com.risherp.service.ReceiptPdfService;
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
public class ReceiptPdfServiceImpl implements ReceiptPdfService {

    @Override
    public byte[] generateReceiptPdf(Receipt receipt) {
        log.info("Generating PDF for receipt: {}", receipt.getReceiptNumber());

        Document document = new Document(PageSize.A4, 36, 36, 36, 120);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            Business biz = receipt.getBusiness();
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
            if (receipt.getPaymentMode() != null) {
                metaFields.put("Payment Mode", receipt.getPaymentMode().toString().replace('_', ' '));
            }
            if (receipt.getReferenceNumber() != null && !receipt.getReferenceNumber().isBlank()) {
                metaFields.put("Reference No", receipt.getReferenceNumber());
            }

            String dateStr = receipt.getReceiptDate() != null ? receipt.getReceiptDate().format(PdfComponents.DATE_FORMAT) : "—";
            document.add(PdfComponents.createDocumentHeader(
                    bizName, bizEmail, bizMobile, bizAddress,
                    "RECEIPT", receipt.getReceiptNumber(), dateStr, metaFields
            ));

            PdfComponents.addSeparator(document);

            Party party = receipt.getParty();
            String partyName = party != null ? party.getPartyName() : "Customer";
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
                    "RECEIVED FROM (CUSTOMER):", partyName, partyCode, partyPhone, partyEmail, addrBuilder.toString()
            ));

            document.add(new Paragraph(" "));

            if (receipt.getAllocations() != null && !receipt.getAllocations().isEmpty()) {
                String[] headers = {"#", "SALES INVOICE", "INVOICE DATE", "INVOICE AMOUNT", "SETTLED AMOUNT"};
                float[] widths = {6f, 34f, 20f, 20f, 20f};
                int[] aligns = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};

                List<String[]> rows = new ArrayList<>();
                int index = 1;
                for (ReceiptAllocation alloc : receipt.getAllocations()) {
                    Sale sale = alloc.getSale();
                    String invNum = sale != null ? sale.getInvoiceNumber() : "N/A";
                    String invDate = sale != null && sale.getSaleDate() != null ? sale.getSaleDate().format(PdfComponents.DATE_FORMAT) : "—";
                    String invAmount = sale != null ? PdfComponents.CURRENCY_FORMAT.format(sale.getGrandTotal()) : "—";

                    rows.add(new String[]{
                            String.valueOf(index++),
                            invNum,
                            invDate,
                            invAmount,
                            PdfComponents.CURRENCY_FORMAT.format(alloc.getAllocatedAmount())
                    });
                }

                document.add(PdfComponents.createItemsTable(headers, widths, aligns, rows));
                document.add(new Paragraph(" "));
            }

            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{55f, 45f});

            PdfPCell notesCell = new PdfPCell();
            notesCell.setBorder(Rectangle.NO_BORDER);
            notesCell.setPadding(6f);
            if (receipt.getNotes() != null && !receipt.getNotes().trim().isEmpty()) {
                notesCell.addElement(new Paragraph("NOTES:", PdfComponents.SMALL_FONT));
                notesCell.addElement(new Paragraph(receipt.getNotes(), PdfComponents.SMALL_FONT));
            }
            summaryTable.addCell(notesCell);

            PdfPTable calcTable = new PdfPTable(2);
            calcTable.setWidthPercentage(100);
            calcTable.setWidths(new float[]{50f, 50f});

            if (receipt.getAllocatedAmount() != null && receipt.getAllocatedAmount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Allocated to Invoices:", PdfComponents.CURRENCY_FORMAT.format(receipt.getAllocatedAmount()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);
            }
            if (receipt.getUnallocatedAmount() != null && receipt.getUnallocatedAmount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Customer Advance/Credit:", PdfComponents.CURRENCY_FORMAT.format(receipt.getUnallocatedAmount()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);
            }

            PdfComponents.addSummaryRow(calcTable, "AMOUNT RECEIVED", PdfComponents.CURRENCY_FORMAT.format(receipt.getAmount()), 
                    PdfComponents.GRAND_TOTAL_LABEL_FONT, PdfComponents.GRAND_TOTAL_VAL_FONT, 
                    Rectangle.TOP | Rectangle.BOTTOM, PdfComponents.BORDER_COLOR);

            PdfPCell calcCell = new PdfPCell(calcTable);
            calcCell.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(calcCell);

            document.add(summaryTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            PdfPTable footer = PdfComponents.createDocumentFooter(null, null, "Generated by RISHERP Enterprise Billing", "Authorised Signatory");
            PdfComponents.drawFooterAtBottom(writer, document, footer);
            document.close();
            
            log.info("Receipt PDF generated successfully for {}", receipt.getReceiptNumber());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for receipt {}: {}", receipt.getReceiptNumber(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
}
