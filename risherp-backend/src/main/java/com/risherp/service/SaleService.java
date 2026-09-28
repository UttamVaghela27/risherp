package com.risherp.service;

import com.risherp.dto.sales.CreateSaleRequest;
import com.risherp.dto.sales.SaleResponse;
import com.risherp.dto.sales.SaleSummaryDTO;
import com.risherp.entity.SaleStatus;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

/**
 * SaleService — business operations for the Sales & Billing module.
 */
public interface SaleService {

    /** Create a new sale atomically (validate → recalculate → stock deduct → save). */
    SaleResponse createSale(CreateSaleRequest request, Long businessId, UserPrincipal principal, String clientIp);

    /** Paginated, filtered sales history. */
    Page<SaleResponse> getSales(Long businessId, String search, Long partyId, String paymentStatus,
                                SaleStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable);

    /** Get full sale with items by internal ID. */
    SaleResponse getSaleById(Long id, Long businessId);

    /** Look up by invoice number. */
    SaleResponse getSaleByInvoiceNumber(String invoiceNumber, Long businessId);

    /** All sales for a specific customer. */
    Page<SaleResponse> getSalesByCustomer(Long partyId, Long businessId, Pageable pageable);

    /** KPI dashboard summary with optional filters. */
    SaleSummaryDTO getSaleSummary(Long businessId, String search, Long partyId, String paymentStatus,
                                  SaleStatus status, LocalDate fromDate, LocalDate toDate);

    /** KPI dashboard summary without filters. */
    SaleSummaryDTO getSaleSummary(Long businessId);

    /** Generate authoritative PDF for a sale. */
    byte[] generateInvoicePdf(Long id, Long businessId);

    /** Atomically cancel a sale and reverse stock deductions. */
    SaleResponse cancelSale(Long id, Long businessId, UserPrincipal principal, String clientIp);
}
