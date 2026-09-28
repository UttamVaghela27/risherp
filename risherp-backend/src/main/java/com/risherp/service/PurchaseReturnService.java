package com.risherp.service;

import com.risherp.dto.purchasereturn.*;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * PurchaseReturnService
 * Core business service for Phase 13 Purchase Return Management.
 */
public interface PurchaseReturnService {

    PurchaseReturnResponse createPurchaseReturn(CreatePurchaseReturnRequest request,
                                                Long businessId,
                                                UserPrincipal principal,
                                                String clientIp);

    Page<PurchaseReturnResponse> getPurchaseReturns(Long businessId,
                                                    String search,
                                                    Long partyId,
                                                    String status,
                                                    LocalDate fromDate,
                                                    LocalDate toDate,
                                                    Pageable pageable);

    PurchaseReturnResponse getPurchaseReturnById(Long id, Long businessId);

    PurchaseReturnResponse getPurchaseReturnByNumber(String returnNumber, Long businessId);

    List<PurchaseReturnResponse> getPurchaseReturnsByPurchase(Long purchaseId, Long businessId);

    List<ReturnablePurchaseItemResponse> getReturnableItems(Long purchaseId, Long businessId);

    PurchaseReturnSummaryDTO getPurchaseReturnSummary(Long businessId);

    PurchaseReturnResponse cancelPurchaseReturn(Long id, Long businessId, UserPrincipal principal, String clientIp);

    byte[] generatePurchaseReturnPdf(Long id, Long businessId);
}
