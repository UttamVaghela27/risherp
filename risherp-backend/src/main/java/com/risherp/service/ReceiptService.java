package com.risherp.service;

import com.risherp.dto.receipt.*;
import com.risherp.entity.PaymentMode;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

/**
 * ReceiptService
 * Core business service for Customer Receipts & Invoice Settlements.
 */
public interface ReceiptService {

    ReceiptResponse createReceipt(CreateReceiptRequest request,
                                  Long businessId,
                                  UserPrincipal principal,
                                  String clientIp);

    Page<ReceiptResponse> getReceipts(Long businessId,
                                      String search,
                                      Long partyId,
                                      String status,
                                      PaymentMode paymentMode,
                                      LocalDate fromDate,
                                      LocalDate toDate,
                                      Pageable pageable);

    ReceiptResponse getReceiptById(Long id, Long businessId);

    ReceiptResponse getReceiptByNumber(String receiptNumber, Long businessId);

    ReceiptSummaryDTO getReceiptSummary(Long businessId);

    List<OutstandingSaleResponse> getOutstandingSales(Long partyId, Long businessId);

    ReceiptResponse cancelReceipt(Long id, Long businessId, UserPrincipal principal, String clientIp);

    byte[] generateReceiptPdf(Long id, Long businessId);
}
