package com.risherp.dto.purchase;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * PurchaseSummaryDTO — aggregated KPI metrics for the Purchase History dashboard.
 * Returned by GET /api/purchases/summary.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseSummaryDTO {

    /** Total count of purchase invoices matching the filter */
    private long totalInvoices;

    /** Total grand total amount (sum of grandTotal) across filtered invoices */
    private BigDecimal totalPurchases;

    /** Alias for totalPurchases for backward compatibility */
    private BigDecimal totalPurchasesAmount;

    /** Total amount paid (sum of paidAmount) across filtered invoices */
    private BigDecimal totalPaid;

    /** Total outstanding balance (sum of balanceAmount) across filtered invoices */
    private BigDecimal totalOutstanding;

    /** Alias for totalOutstanding for backward compatibility */
    private BigDecimal totalBalance;

    /** Count of invoices fully paid */
    private long paidCount;

    /** Count of invoices partially paid */
    private long partialCount;

    /** Count of invoices pending payment */
    private long pendingCount;

    /** Count of purchases recorded today */
    private long todayPurchasesCount;

    /** Total purchases amount recorded today */
    private BigDecimal todayPurchasesAmount;
}
