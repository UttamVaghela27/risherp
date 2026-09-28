package com.risherp.entity;

/**
 * SaleStatus — lifecycle state of a sale record.
 * COMPLETED : Normal sale that has been saved and is active.
 * CANCELLED : Cancelled sale; preserved for audit history.
 */
public enum SaleStatus {
    COMPLETED,
    CANCELLED
}
