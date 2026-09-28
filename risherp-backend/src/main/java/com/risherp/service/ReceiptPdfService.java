package com.risherp.service;

import com.risherp.entity.Receipt;

/**
 * ReceiptPdfService
 * Generates official Customer Payment Receipt PDF documents.
 */
public interface ReceiptPdfService {

    byte[] generateReceiptPdf(Receipt receipt);
}
