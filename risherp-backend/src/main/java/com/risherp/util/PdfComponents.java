package com.risherp.util;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;

import java.awt.Color;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

public class PdfComponents {

    public static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("₹ #,##0.00");
    public static final DecimalFormat QTY_FORMAT = new DecimalFormat("#,##0.###");
    public static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Colors matching RISHERP enterprise theme
    public static final Color PRIMARY_COLOR = new Color(30, 58, 138);     // #1E3A8A Dark Navy
    public static final Color SECONDARY_COLOR = new Color(71, 85, 105);   // #475569 Slate
    public static final Color HEADER_BG = new Color(241, 245, 249);       // #F1F5F9 Light Slate
    public static final Color BORDER_COLOR = new Color(226, 232, 240);    // #E2E8F0 Border
    public static final Color SUCCESS_COLOR = new Color(22, 163, 74);     // #16A34A Green
    public static final Color ERROR_COLOR = new Color(220, 38, 38);       // #DC2626 Red
    public static final Color WARNING_COLOR = new Color(217, 119, 6);     // #D97706 Amber

    public static final Font TITLE_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, PRIMARY_COLOR);
    public static final Font DOC_NUM_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, PRIMARY_COLOR);
    public static final Font BOLD_LABEL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.DARK_GRAY);
    public static final Font REGULAR_FONT = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
    public static final Font SMALL_FONT = FontFactory.getFont(FontFactory.HELVETICA, 8, SECONDARY_COLOR);
    public static final Font TABLE_HEADER_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, PRIMARY_COLOR);
    public static final Font GRAND_TOTAL_LABEL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY_COLOR);
    public static final Font GRAND_TOTAL_VAL_FONT = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, PRIMARY_COLOR);

    public static void addSeparator(Document document) throws Exception {
        document.add(new Paragraph(" "));
        LineSeparator sep = new LineSeparator(1f, 100, BORDER_COLOR, Element.ALIGN_CENTER, -2);
        document.add(sep);
        document.add(new Paragraph(" "));
    }

    public static PdfPTable createDocumentHeader(String bizName, String bizEmail, String bizPhone, String bizAddress,
                                                 String docTitle, String docNumber, String dateStr,
                                                 Map<String, String> metaFields) throws Exception {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60f, 40f});

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        leftCell.addElement(new Paragraph(bizName != null ? bizName : "Enterprise", TITLE_FONT));
        leftCell.addElement(new Paragraph(docTitle, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, SECONDARY_COLOR)));

        if (bizAddress != null && !bizAddress.isBlank()) {
            leftCell.addElement(new Paragraph(bizAddress, SMALL_FONT));
        }

        String contactStr = "";
        if (bizPhone != null && !bizPhone.isEmpty()) contactStr += "Phone: " + bizPhone;
        if (bizEmail != null && !bizEmail.isEmpty()) contactStr += (contactStr.isEmpty() ? "" : " | ") + "Email: " + bizEmail;
        if (!contactStr.isEmpty()) {
            leftCell.addElement(new Paragraph(contactStr, SMALL_FONT));
        }
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph invNumP = new Paragraph(docNumber, DOC_NUM_FONT);
        invNumP.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(invNumP);

        Paragraph dateP = new Paragraph("Date: " + dateStr, REGULAR_FONT);
        dateP.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(dateP);

        if (metaFields != null) {
            for (Map.Entry<String, String> entry : metaFields.entrySet()) {
                Paragraph p = new Paragraph(entry.getKey() + ": " + entry.getValue(), SMALL_FONT);
                p.setAlignment(Element.ALIGN_RIGHT);
                rightCell.addElement(p);
            }
        }
        headerTable.addCell(rightCell);
        return headerTable;
    }

    public static PdfPTable createPartyInformation(String title, String partyName, String code, String phone, String email, String address) throws Exception {
        PdfPTable partyTable = new PdfPTable(1);
        partyTable.setWidthPercentage(100);

        PdfPCell partyCell = new PdfPCell();
        partyCell.setBackgroundColor(HEADER_BG);
        partyCell.setBorderColor(BORDER_COLOR);
        partyCell.setPadding(10f);

        partyCell.addElement(new Paragraph(title, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, SECONDARY_COLOR)));
        partyCell.addElement(new Paragraph(partyName != null ? partyName : "N/A", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, PRIMARY_COLOR)));

        StringBuilder details = new StringBuilder();
        if (code != null && !code.isEmpty()) details.append("Code: ").append(code).append("  ");
        if (phone != null && !phone.isEmpty()) details.append("| Phone: ").append(phone).append("  ");
        if (email != null && !email.isEmpty()) details.append("| Email: ").append(email).append("  ");
        if (details.length() > 0) partyCell.addElement(new Paragraph(details.toString(), SMALL_FONT));

        if (address != null && !address.isEmpty()) {
            partyCell.addElement(new Paragraph("Address: " + address, SMALL_FONT));
        }
        partyTable.addCell(partyCell);
        return partyTable;
    }

    public static PdfPTable createItemsTable(String[] headers, float[] widths, int[] aligns, List<String[]> rows) throws Exception {
        PdfPTable itemTable = new PdfPTable(headers.length);
        itemTable.setWidthPercentage(100);
        itemTable.setWidths(widths);

        for (int i = 0; i < headers.length; i++) {
            PdfPCell th = new PdfPCell(new Phrase(headers[i], TABLE_HEADER_FONT));
            th.setBackgroundColor(HEADER_BG);
            th.setBorderColor(BORDER_COLOR);
            th.setPadding(6f);
            th.setHorizontalAlignment(aligns[i]);
            itemTable.addCell(th);
        }

        for (String[] row : rows) {
            for (int i = 0; i < row.length; i++) {
                Font f = (i == row.length - 1) ? BOLD_LABEL_FONT : REGULAR_FONT;
                
                // For item description which might have multiple lines (ItemName \n Code)
                Paragraph p = new Paragraph();
                if (row[i] != null && row[i].contains("\n")) {
                    String[] parts = row[i].split("\n");
                    p.add(new Phrase(parts[0], BOLD_LABEL_FONT));
                    p.add(Chunk.NEWLINE);
                    p.add(new Phrase(parts[1], SMALL_FONT));
                } else {
                    p.add(new Phrase(row[i] != null ? row[i] : "", f));
                }

                PdfPCell cell = new PdfPCell(p);
                cell.setHorizontalAlignment(aligns[i]);
                cell.setBorderColor(BORDER_COLOR);
                cell.setPadding(6f);
                itemTable.addCell(cell);
            }
        }
        return itemTable;
    }

    public static void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valFont) {
        addSummaryRow(table, label, value, labelFont, valFont, Rectangle.NO_BORDER, BORDER_COLOR);
    }
    
    public static void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valFont, int border, Color borderColor) {
        PdfPCell lCell = new PdfPCell(new Phrase(label, labelFont));
        lCell.setBorder(border);
        lCell.setBorderColor(borderColor);
        lCell.setPadding(4f);
        table.addCell(lCell);

        PdfPCell vCell = new PdfPCell(new Phrase(value, valFont));
        vCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        vCell.setBorder(border);
        vCell.setBorderColor(borderColor);
        vCell.setPadding(4f);
        table.addCell(vCell);
    }

    public static PdfPTable createDocumentFooter(String terms, String notes, String leftFooterText, String signatureTitle) throws Exception {
        PdfPTable footerTable = new PdfPTable(2);
        footerTable.setWidthPercentage(100);
        footerTable.setWidths(new float[]{60f, 40f});

        PdfPCell termsCell = new PdfPCell();
        termsCell.setBorder(Rectangle.NO_BORDER);

        if (terms != null && !terms.isBlank()) {
            termsCell.addElement(new Paragraph(terms, SMALL_FONT));
        }

        if (notes != null && !notes.isBlank()) {
            termsCell.addElement(new Paragraph("Notes: " + notes, SMALL_FONT));
        }

        termsCell.addElement(new Paragraph(leftFooterText, FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 7, SECONDARY_COLOR)));
        footerTable.addCell(termsCell);

        PdfPCell signCell = new PdfPCell();
        signCell.setBorder(Rectangle.NO_BORDER);
        signCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph signLine = new Paragraph("____________________________________", SMALL_FONT);
        signLine.setAlignment(Element.ALIGN_CENTER);
        signCell.addElement(signLine);

        Paragraph signTitle = new Paragraph(signatureTitle, BOLD_LABEL_FONT);
        signTitle.setAlignment(Element.ALIGN_CENTER);
        signCell.addElement(signTitle);

        footerTable.addCell(signCell);
        return footerTable;
    }

    public static void drawFooterAtBottom(PdfWriter writer, Document document, PdfPTable footerTable) {
        footerTable.setTotalWidth(document.right() - document.left());
        float footerHeight = footerTable.getTotalHeight();
        // Fixed 36 points from the absolute bottom of the page
        float yPos = 36 + footerHeight;
        footerTable.writeSelectedRows(0, -1, document.left(), yPos, writer.getDirectContent());
    }
}
