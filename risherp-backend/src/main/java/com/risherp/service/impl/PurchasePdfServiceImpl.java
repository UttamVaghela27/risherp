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
import com.risherp.entity.Purchase;
import com.risherp.entity.PurchaseItem;
import com.risherp.service.PurchasePdfService;
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
public class PurchasePdfServiceImpl implements PurchasePdfService {

    @Override
    public byte[] generatePurchasePdf(Purchase purchase) {
        log.info("Generating PDF for purchase invoice: {}", purchase.getPurchaseNumber());

        Document document = new Document(PageSize.A4, 36, 36, 36, 120);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            document.open();

            Business biz = purchase.getBusiness();
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
            metaFields.put("Type", purchase.getPurchaseType() != null ? purchase.getPurchaseType().name() : "CASH");
            metaFields.put("Payment", purchase.getPaymentStatus() != null ? purchase.getPaymentStatus().name() : "PENDING");
            if (purchase.getPaymentMode() != null) {
                metaFields.put("Payment Mode", purchase.getPaymentMode().name());
            }

            String dateStr = purchase.getPurchaseDate() != null ? purchase.getPurchaseDate().format(PdfComponents.DATE_FORMAT) : "—";
            document.add(PdfComponents.createDocumentHeader(
                    bizName, bizEmail, bizMobile, bizAddress,
                    "PURCHASE INVOICE / VOUCHER", purchase.getPurchaseNumber(), dateStr, metaFields
            ));

            PdfComponents.addSeparator(document);

            Party party = purchase.getParty();
            String partyName = party != null ? party.getPartyName() : "Cash Vendor";
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
                    "SUPPLIER / VENDOR DETAILS", partyName, partyCode, partyPhone, partyEmail, addrBuilder.toString()
            ));

            document.add(new Paragraph(" "));

            String[] headers = {"#", "ITEM DESCRIPTION", "QTY", "UNIT", "RATE", "DISCOUNT", "AMOUNT"};
            float[] widths = {6f, 38f, 10f, 10f, 12f, 11f, 13f};
            int[] aligns = {Element.ALIGN_CENTER, Element.ALIGN_LEFT, Element.ALIGN_CENTER, Element.ALIGN_CENTER, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT, Element.ALIGN_RIGHT};

            List<String[]> rows = new ArrayList<>();
            int index = 1;
            for (PurchaseItem item : purchase.getPurchaseItems()) {
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
            if (purchase.getNotes() != null && !purchase.getNotes().trim().isEmpty()) {
                notesCell.addElement(new Paragraph("NOTES:", PdfComponents.SMALL_FONT));
                notesCell.addElement(new Paragraph(purchase.getNotes(), PdfComponents.SMALL_FONT));
            }
            summaryTable.addCell(notesCell);

            PdfPTable calcTable = new PdfPTable(2);
            calcTable.setWidthPercentage(100);
            calcTable.setWidths(new float[]{50f, 50f});

            PdfComponents.addSummaryRow(calcTable, "Subtotal:", PdfComponents.CURRENCY_FORMAT.format(purchase.getSubtotal()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);

            if (purchase.getItemDiscount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Item Discount:", "-" + PdfComponents.CURRENCY_FORMAT.format(purchase.getItemDiscount()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }
            if (purchase.getOverallDiscount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Overall Discount:", "-" + PdfComponents.CURRENCY_FORMAT.format(purchase.getOverallDiscount()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }
            if (purchase.getTotalDiscount().compareTo(BigDecimal.ZERO) > 0) {
                PdfComponents.addSummaryRow(calcTable, "Total Discount:", "-" + PdfComponents.CURRENCY_FORMAT.format(purchase.getTotalDiscount()), PdfComponents.SMALL_FONT, PdfComponents.SMALL_FONT);
            }

            PdfComponents.addSummaryRow(calcTable, "Grand Total:", PdfComponents.CURRENCY_FORMAT.format(purchase.getGrandTotal()), 
                    PdfComponents.GRAND_TOTAL_LABEL_FONT, PdfComponents.GRAND_TOTAL_VAL_FONT, 
                    Rectangle.TOP | Rectangle.BOTTOM, PdfComponents.BORDER_COLOR);

            PdfComponents.addSummaryRow(calcTable, "Paid Amount:", PdfComponents.CURRENCY_FORMAT.format(purchase.getPaidAmount()), PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);

            String balLabel = "Balance Due:";
            String balValue = "₹ 0.00";
            if (purchase.getBalanceAmount().compareTo(BigDecimal.ZERO) > 0) {
                balValue = PdfComponents.CURRENCY_FORMAT.format(purchase.getBalanceAmount());
            }
            PdfComponents.addSummaryRow(calcTable, balLabel, balValue, PdfComponents.REGULAR_FONT, PdfComponents.REGULAR_FONT);

            PdfPCell calcCell = new PdfPCell(calcTable);
            calcCell.setBorder(Rectangle.NO_BORDER);
            summaryTable.addCell(calcCell);

            document.add(summaryTable);
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));

            PdfPTable footer = PdfComponents.createDocumentFooter("Purchase Voucher - Internal Accounts Copy", null, "Generated by RISHERP Enterprise Billing", "Receiver / Store In-charge");
            PdfComponents.drawFooterAtBottom(writer, document, footer);
            document.close();
            
            log.info("Purchase PDF generated successfully for {}", purchase.getPurchaseNumber());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for purchase {}: {}", purchase.getPurchaseNumber(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage(), e);
        }
    }
}
