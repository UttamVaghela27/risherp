package com.risherp.service;

import com.risherp.entity.PaymentTxn;

/**
 * PaymentPdfService
 * Generates official Supplier Payment Voucher PDF documents.
 */
public interface PaymentPdfService {

    byte[] generatePaymentPdf(PaymentTxn payment);
}
