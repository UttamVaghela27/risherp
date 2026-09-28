package com.risherp.entity;

/**
 * ReceiptStatus — lifecycle states of a customer receipt.
 *
 * COMPLETED : Receipt recorded, invoice balances updated, credit tracked.
 * CANCELLED : Receipt cancelled, invoice balances restored.
 */
public enum ReceiptStatus {
    COMPLETED,
    CANCELLED
}
