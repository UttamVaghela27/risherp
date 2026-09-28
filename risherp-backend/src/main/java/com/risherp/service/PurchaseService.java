package com.risherp.service;

import com.risherp.dto.purchase.CreatePurchaseRequest;
import com.risherp.dto.purchase.PurchaseResponse;
import com.risherp.dto.purchase.PurchaseSummaryDTO;
import com.risherp.entity.PaymentStatus;
import com.risherp.entity.PurchaseStatus;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PurchaseService {

    PurchaseResponse createPurchase(CreatePurchaseRequest request, Long businessId, UserPrincipal principal);

    PurchaseResponse getPurchaseById(Long id, Long businessId);

    PurchaseResponse getPurchaseByNumber(String purchaseNumber, Long businessId);

    Page<PurchaseResponse> getPurchases(Long businessId, String search, LocalDate fromDate, LocalDate toDate,
                                        Long partyId, PaymentStatus paymentStatus, PurchaseStatus status, Pageable pageable);

    Page<PurchaseResponse> getSupplierPurchases(Long partyId, Long businessId, Pageable pageable);

    PurchaseSummaryDTO getPurchaseSummary(Long businessId);

    PurchaseSummaryDTO getPurchaseSummary(Long businessId, String search, Long partyId, PaymentStatus paymentStatus,
                                          PurchaseStatus status, LocalDate fromDate, LocalDate toDate);

    PurchaseResponse cancelPurchase(Long id, Long businessId, UserPrincipal principal, String clientIp);

    byte[] generatePurchasePdf(Long id, Long businessId);
}
