package com.risherp.service;

import com.risherp.entity.Sale;

/**
 * InvoicePdfService — Authoritative enterprise PDF generator interface.
 */
public interface InvoicePdfService {

    /**
     * Generate authoritative PDF byte array for a persistent sale record.
     *
     * @param sale Persistent Sale entity with loaded snapshot items
     * @return PDF binary byte array
     */
    byte[] generateInvoicePdf(Sale sale);
}
