package com.risherp.entity;

/**
 * SalesReturnStatus — lifecycle states of a Sales Return transaction.
 *
 * COMPLETED  : Return accepted, stock increased, customer balance adjusted.
 * CANCELLED  : Return was reversed; stock and financial impacts undone.
 */
public enum SalesReturnStatus {
    COMPLETED,
    CANCELLED
}
