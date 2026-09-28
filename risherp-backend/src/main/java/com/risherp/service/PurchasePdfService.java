package com.risherp.service;

import com.risherp.entity.Purchase;

/**
 * PurchasePdfService — Authoritative enterprise PDF generator interface for Purchase orders/invoices.
 */
public interface PurchasePdfService {

    /**
     * Generate authoritative PDF byte array for a persistent Purchase record.
     *
     * @param purchase Persistent Purchase entity with loaded snapshot items
     * @return PDF binary byte array
     */
    byte[] generatePurchasePdf(Purchase purchase);
}
