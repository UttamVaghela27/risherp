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
import com.risherp.entity.PaymentTxn;
import com.risherp.entity.PaymentAllocation;
import com.risherp.entity.Purchase;
import com.risherp.service.PaymentPdfService;
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
public class PaymentPdfServiceImpl implements PaymentPdfService {

    @Override
    public byte[] generatePaymentPdf(PaymentTxn payment) {
        log.info("Generating PDF for payment voucher: {}", payment.getPaymentNumber());

        Document document = new Document(PageSize.A4, 36, 36, 36, 120);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            Business biz = payment.getBusiness();
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
            if (payment.getPaymentMode() != null) {
                metaFields.put("Payment Mode", payment.getPaymentMode().toString().replace('_', ' '));
            }
            if (payment.getReferenceNumber() != null && !payment.getReferenceNumber().isBlank()) {
                metaFields.put("Reference No", payment.getReferenceNumber());
            }

            String dateStr = payment.getPaymentDate() != null ? payment.getPaymentDate().format(PdfComponents.DATE_FORMAT) : "—";
            document.add(PdfComponents.createDocumentHeader(
                    bizName, bizEmail, bizMobile, bizAddress,
                    "PAYMENT RECEIPT", payment.getPaymentNumber(), dateStr, metaFields
            ));

            PdfComponents.addSeparator(document);

            Party party = payment.getParty();
            String partyName = party != null ? party.getPartyName() : "Supplier";
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
                    "PAID TO (SUPPLIER / VENDOR):", partyName, partyCode, partyPhone, partyEmail, addrBuilder.toString()
            ));

            document.add(new Paragraph(" "));

            if (payment.getAllocations() != null && !payment.getAllocations().isEmpty()) {
                String[] headers = {"#", "PURCHASE INVOICE", "PURCHASE DATE", "INVOICE AMOUNT", "SETTLED AMOUNT"};
                float[] widths = {6f, 34f, 20f, 20f, 20f};
                int[] aligns = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};

                List<String[]> rows = new ArrayList<>();
                int index = 1;
                for (PaymentAllocation alloc : payment.getAllocations()) {
                    Purchase purchase = alloc.getPurchase();
                    String purNum = purchase != null ? purchase.getPurchaseNumber() : "N/A";
                    String purDate = purchase != null && purchase.getPurchaseDate() != null ? purchase.getPurchaseDate().format(PdfComponents.DATE_FORMAT) : "—";
                    String purAmount = purchase != null ? PdfComponents.CURRENCY_FORMAT.format(purchase.getGrandTotal()) : "—";

                    rows.add(new String[]{
                            String.valueOf(index++),
                            purNum,
                            purDate,
                            purAmount,
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
            if (payment.getNotes() != null && !payment.getNotes().trim().isEmpty()) {
                notesCell.addElement(new Paragraph("NOTES:", PdfComponents.SMALL_FONT));
                notesCell.addElement(new Paragraph(payment.getNotes(), PdfComponents.SMALL_FONT));
            }
            summaryTable.addCell(notesCell);

            PdfPTable calcTable = new PdfPTable(2);
            calcTable.setWidthPercentage(100);
            calcTable.setWidths(new float[]{50f, 50f});

            if (payment.getAllocatedAmount() != null && payment.getAllocatedAmount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Allocated to Purchases:", PdfComponents.CURRENCY_FORMAT.format(payment.getAllocatedAmount()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);
            }
            if (payment.getUnallocatedAmount() != null && payment.getUnallocatedAmount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Supplier Advance/Debit:", PdfComponents.CURRENCY_FORMAT.format(payment.getUnallocatedAmount()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);
            }

            PdfComponents.addSummaryRow(calcTable, "AMOUNT PAID", PdfComponents.CURRENCY_FORMAT.format(payment.getAmount()), 
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
            
            log.info("Payment PDF generated successfully for {}", payment.getPaymentNumber());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for payment {}: {}", payment.getPaymentNumber(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
}
