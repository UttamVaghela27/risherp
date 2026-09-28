package com.risherp.entity;

/**
 * PurchaseReturnStatus — lifecycle states of a Purchase Return transaction.
 *
 * COMPLETED : Return finalized, stock decreased, supplier balance adjusted / refund recorded.
 * CANCELLED : Return reversed, stock returned, financial impacts undone.
 */
public enum PurchaseReturnStatus {
    COMPLETED,
    CANCELLED
}
