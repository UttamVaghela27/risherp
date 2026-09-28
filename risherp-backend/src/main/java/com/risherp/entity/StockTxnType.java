package com.risherp.entity;

/**
 * StockTxnType — Direction of a stock movement.
 *
 * IN  = stock increased (Purchase received, Sale cancelled, manual adjustment up)
 * OUT = stock decreased (Sale created, Purchase cancelled, manual adjustment down)
 */
public enum StockTxnType {
    IN,
    OUT
}
