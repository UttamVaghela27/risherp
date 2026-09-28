package com.risherp.service;

import com.risherp.dto.payment.*;
import com.risherp.entity.PaymentMode;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * PaymentTxnService
 * Core business service for Supplier Payments & Purchase Settlements.
 */
public interface PaymentTxnService {

    PaymentResponse createPayment(CreatePaymentRequest request,
                                  Long businessId,
                                  UserPrincipal principal,
                                  String clientIp);

    Page<PaymentResponse> getPayments(Long businessId,
                                      String search,
                                      Long partyId,
                                      String status,
                                      PaymentMode paymentMode,
                                      LocalDate fromDate,
                                      LocalDate toDate,
                                      Pageable pageable);

    PaymentResponse getPaymentById(Long id, Long businessId);

    PaymentResponse getPaymentByNumber(String paymentNumber, Long businessId);

    PaymentSummaryDTO getPaymentSummary(Long businessId);

    List<OutstandingPurchaseResponse> getOutstandingPurchases(Long partyId, Long businessId);

    PaymentResponse cancelPayment(Long id, Long businessId, UserPrincipal principal, String clientIp);

    byte[] generatePaymentPdf(Long id, Long businessId);
}
