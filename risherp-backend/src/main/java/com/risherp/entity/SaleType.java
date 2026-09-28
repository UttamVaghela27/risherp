package com.risherp.entity;

/**
 * SaleType — classifies how a sale is settled financially.
 * CASH   : Full payment expected at time of sale.
 * CREDIT : Payment deferred; customer owes the balance.
 * PARTIAL: Partial upfront payment, remainder on credit.
 */
public enum SaleType {
    CASH,
    CREDIT,
    PARTIAL
}
