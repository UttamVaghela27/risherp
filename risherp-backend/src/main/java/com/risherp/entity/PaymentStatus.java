package com.risherp.entity;

/**
 * PaymentStatus — tracks the settlement state of a sale invoice.
 * PAID    : paidAmount == grandTotal
 * PARTIAL : 0 < paidAmount < grandTotal
 * PENDING : paidAmount == 0
 */
public enum PaymentStatus {
    PAID,
    PARTIAL,
    PENDING
}
