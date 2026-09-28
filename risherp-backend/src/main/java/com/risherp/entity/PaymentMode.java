package com.risherp.entity;

/**
 * PaymentMode — the medium used to make payment for a sale.
 * Full payment module will be implemented in a later phase.
 * This enum prepares the sales record with payment mode metadata.
 */
public enum PaymentMode {
    CASH,
    UPI,
    BANK_TRANSFER,
    CHEQUE,
    OTHER
}
