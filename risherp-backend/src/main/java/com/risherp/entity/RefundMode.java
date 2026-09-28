package com.risherp.entity;

/**
 * RefundMode — how the customer's money is returned or credit is applied.
 *
 * CASH              : Physical cash handed back to customer.
 * BANK              : Bank transfer to customer's account.
 * CREDIT_ADJUSTMENT : Applied as credit note; reduces outstanding balance.
 *                     This is the default until Phase 14 Ledger is implemented.
 */
public enum RefundMode {
    CASH,
    BANK,
    CREDIT_ADJUSTMENT
}
