package com.risherp.entity;

/**
 * PaymentTxnStatus — lifecycle states of a supplier payment.
 *
 * COMPLETED : Payment processed, purchase balances updated, debit tracked.
 * CANCELLED : Payment cancelled, purchase balances restored.
 */
public enum PaymentTxnStatus {
    COMPLETED,
    CANCELLED
}
