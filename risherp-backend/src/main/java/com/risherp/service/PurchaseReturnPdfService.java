package com.risherp.service;

import com.risherp.entity.PurchaseReturn;

/**
 * PurchaseReturnPdfService
 * Generates official Debit Note / Purchase Return PDF documents.
 */
public interface PurchaseReturnPdfService {

    byte[] generatePurchaseReturnPdf(PurchaseReturn purchaseReturn);
}
