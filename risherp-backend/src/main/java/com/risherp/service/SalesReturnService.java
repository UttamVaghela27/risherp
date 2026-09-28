package com.risherp.service;

import com.risherp.dto.salesreturn.*;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * SalesReturnService — business operations for Phase 12 Sales Return module.
 */
public interface SalesReturnService {

    /**
     * Create a new sales return atomically.
     * Validates → calculates → creates return + items → increases stock → commits.
     */
    SalesReturnResponse createSalesReturn(CreateSalesReturnRequest request,
                                          Long businessId,
                                          UserPrincipal principal,
                                          String clientIp);

    /** Paginated, filtered sales return history. */
    Page<SalesReturnResponse> getSalesReturns(Long businessId, String search, Long partyId,
                                               String status, LocalDate fromDate, LocalDate toDate,
                                               Pageable pageable);

    /** Full return detail by internal ID. */
    SalesReturnResponse getSalesReturnById(Long id, Long businessId);

    /** Look up by return number (SR-000001). */
    SalesReturnResponse getSalesReturnByNumber(String returnNumber, Long businessId);

    /** All returns for a specific original sale. */
    List<SalesReturnResponse> getSalesReturnsBySale(Long saleId, Long businessId);

    /**
     * Returnable items for a given sale — pre-calculates alreadyReturnedQuantity
     * and returnableQuantity for each SaleItem. Called before creating a return.
     */
    List<ReturnableSaleItemResponse> getReturnableItems(Long saleId, Long businessId);

    /** KPI aggregates for the summary cards. */
    SalesReturnSummaryDTO getSalesReturnSummary(Long businessId);

    /** Cancel a completed return and reverse all stock/financial impacts. */
    SalesReturnResponse cancelSalesReturn(Long id, Long businessId, UserPrincipal principal, String clientIp);

    /** Generate PDF bytes for a sales return. */
    byte[] generateSalesReturnPdf(Long id, Long businessId);
}
