package com.risherp.service.impl;

import com.risherp.dto.payment.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.PaymentPdfService;
import com.risherp.service.PaymentTxnService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PaymentTxnServiceImpl — Phase 14 implementation for Supplier Payments.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentTxnServiceImpl implements PaymentTxnService {

    private final PaymentTxnRepository paymentTxnRepository;
    private final PaymentAllocationRepository paymentAllocationRepository;
    private final PurchaseRepository purchaseRepository;
    private final PartyRepository partyRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final PaymentPdfService paymentPdfService;
    private final com.risherp.service.FinancialPostingService financialPostingService;
    private final com.risherp.service.DocumentSequenceService documentSequenceService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @Override
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request,
                                         Long businessId,
                                         UserPrincipal principal,
                                         String clientIp) {
        log.info("Creating supplier payment for partyId={}, businessId={}", request.getPartyId(), businessId);

        // 1. Load business
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        // 2. Load and validate supplier party
        Party party = partyRepository.findByIdAndBusinessId(request.getPartyId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: ID " + request.getPartyId()));

        if (party.getStatus() != PartyStatus.ACTIVE) {
            throw new BadRequestException("Supplier " + party.getPartyName() + " is inactive.");
        }

        if (party.getPartyType() != PartyType.SUPPLIER && party.getPartyType() != PartyType.BOTH) {
            throw new BadRequestException("Party " + party.getPartyName() + " is not a supplier.");
        }

        // 3. Validate payment amount & date
        BigDecimal paymentAmount = request.getAmount();
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero.");
        }

        LocalDate paymentDate = request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now();
        if (paymentDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Payment date cannot be in the future.");
        }

        // 4. Generate payment number using concurrency-safe document sequence mechanism
        String paymentNumber = documentSequenceService.generateNextNumber(businessId, "PAYMENT");

        // 5. Process Allocations
        List<PaymentAllocation> allocations = new ArrayList<>();
        BigDecimal totalAllocated = BigDecimal.ZERO;

        if (request.getAllocations() != null && !request.getAllocations().isEmpty()) {
            for (PaymentAllocationRequest allocReq : request.getAllocations()) {
                if (allocReq.getAllocatedAmount() == null || allocReq.getAllocatedAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    continue; // Skip zero/empty allocations
                }

                Purchase purchase = purchaseRepository.findByIdAndBusinessId(allocReq.getPurchaseId(), businessId)
                        .orElseThrow(() -> new ResourceNotFoundException("Purchase invoice not found: ID " + allocReq.getPurchaseId()));

                if (!purchase.getParty().getId().equals(party.getId())) {
                    throw new BadRequestException("Purchase " + purchase.getPurchaseNumber() + " does not belong to supplier " + party.getPartyName());
                }

                if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
                    throw new BadRequestException("Cannot allocate payment to cancelled purchase: " + purchase.getPurchaseNumber());
                }

                if (purchase.getBalanceAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new BadRequestException("Purchase " + purchase.getPurchaseNumber() + " is already fully paid.");
                }

                if (allocReq.getAllocatedAmount().compareTo(purchase.getBalanceAmount()) > 0) {
                    throw new BadRequestException(
                            "Allocation amount ₹" + allocReq.getAllocatedAmount() +
                            " exceeds outstanding balance ₹" + purchase.getBalanceAmount() +
                            " for purchase " + purchase.getPurchaseNumber()
                    );
                }

                // Update purchase invoice payment state
                BigDecimal newPaid = purchase.getPaidAmount().add(allocReq.getAllocatedAmount());
                BigDecimal newBalance = purchase.getGrandTotal().subtract(newPaid).max(BigDecimal.ZERO);
                purchase.setPaidAmount(newPaid);
                purchase.setBalanceAmount(newBalance);
                purchase.setPaymentStatus(newBalance.compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL);
                purchaseRepository.save(purchase);

                // Build allocation
                PaymentAllocation allocation = PaymentAllocation.builder()
                        .purchase(purchase)
                        .allocatedAmount(allocReq.getAllocatedAmount())
                        .build();

                allocations.add(allocation);
                totalAllocated = totalAllocated.add(allocReq.getAllocatedAmount());
            }
        }

        if (totalAllocated.compareTo(paymentAmount) > 0) {
            throw new BadRequestException(
                    "Total allocated amount (₹" + totalAllocated + ") exceeds total payment amount (₹" + paymentAmount + ")."
            );
        }

        BigDecimal unallocatedAmount = paymentAmount.subtract(totalAllocated).max(BigDecimal.ZERO);

        // 6. Resolve creator
        User createdBy = (principal != null)
                ? userRepository.findById(principal.getId()).orElse(null)
                : null;

        // 7. Build and save PaymentTxn
        PaymentTxn payment = PaymentTxn.builder()
                .paymentNumber(paymentNumber)
                .party(party)
                .business(business)
                .paymentDate(paymentDate)
                .amount(paymentAmount)
                .paymentMode(request.getPaymentMode())
                .referenceNumber(request.getReferenceNumber())
                .allocatedAmount(totalAllocated)
                .unallocatedAmount(unallocatedAmount)
                .notes(request.getNotes())
                .status(PaymentTxnStatus.COMPLETED)
                .createdBy(createdBy)
                .build();

        PaymentTxn saved = paymentTxnRepository.save(payment);

        // 8. Link and save allocations
        for (PaymentAllocation pa : allocations) {
            pa.setPayment(saved);
        }
        paymentAllocationRepository.saveAll(allocations);
        saved.getAllocations().addAll(allocations);

        // 9. Post to Financial Ledger
        financialPostingService.postPayment(saved, principal);

        // 10. Audit log
        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "PAYMENT", "PAYMENT_CREATED",
                    saved.getId().toString(),
                    "Payment " + paymentNumber + " made to " + party.getPartyName() +
                    " — Amount: ₹" + paymentAmount.toPlainString() + " (" + request.getPaymentMode() + ")",
                    clientIp
            );
        }

        log.info("Payment created: paymentNumber={}, amount={}, allocated={}", paymentNumber, paymentAmount, totalAllocated);
        return toResponse(saved);
    }

    // =========================================================================
    // READ
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPayments(Long businessId, String search, Long partyId,
                                            String status, PaymentMode paymentMode,
                                            LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Specification<PaymentTxn> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (search != null && !search.trim().isEmpty()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                Predicate numMatch   = cb.like(cb.lower(root.get("paymentNumber")), like);
                Predicate partyMatch = cb.like(cb.lower(root.get("party").get("partyName")), like);
                Predicate codeMatch  = cb.like(cb.lower(root.get("party").get("partyCode")), like);
                Predicate refMatch   = cb.like(cb.lower(root.get("referenceNumber")), like);
                predicates.add(cb.or(numMatch, partyMatch, codeMatch, refMatch));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                try {
                    predicates.add(cb.equal(root.get("status"), PaymentTxnStatus.valueOf(status)));
                } catch (IllegalArgumentException ignored) {}
            }
            if (paymentMode != null) {
                predicates.add(cb.equal(root.get("paymentMode"), paymentMode));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paymentDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("paymentDate"), toDate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PaymentTxn> page = paymentTxnRepository.findAll(spec, pageable);
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id, Long businessId) {
        PaymentTxn payment = paymentTxnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: ID " + id));
        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByNumber(String paymentNumber, Long businessId) {
        PaymentTxn payment = paymentTxnRepository.findByPaymentNumberAndBusinessId(paymentNumber, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + paymentNumber));
        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentSummaryDTO getPaymentSummary(Long businessId) {
        long total = paymentTxnRepository.countByBusinessId(businessId);
        long completed = paymentTxnRepository.countByBusinessIdAndStatus(businessId, PaymentTxnStatus.COMPLETED);
        long cancelled = paymentTxnRepository.countByBusinessIdAndStatus(businessId, PaymentTxnStatus.CANCELLED);
        long today = paymentTxnRepository.countTodayByBusinessId(businessId, LocalDate.now());

        BigDecimal totalAmt = paymentTxnRepository.sumTotalAmountByBusinessId(businessId);
        BigDecimal todayAmt = paymentTxnRepository.sumTodayAmountByBusinessId(businessId, LocalDate.now());
        BigDecimal cashAmt  = paymentTxnRepository.sumCashAmountByBusinessId(businessId);
        BigDecimal bankAmt  = paymentTxnRepository.sumBankAmountByBusinessId(businessId);
        BigDecimal upiAmt   = paymentTxnRepository.sumUpiAmountByBusinessId(businessId);
        BigDecimal otherAmt = paymentTxnRepository.sumOtherAmountByBusinessId(businessId);
        BigDecimal allocAmt = paymentTxnRepository.sumAllocatedAmountByBusinessId(businessId);
        BigDecimal unallocAmt = paymentTxnRepository.sumUnallocatedAmountByBusinessId(businessId);

        return PaymentSummaryDTO.builder()
                .totalPayments(total)
                .todayPayments(today)
                .completedPayments(completed)
                .cancelledPayments(cancelled)
                .totalAmount(totalAmt != null ? totalAmt : BigDecimal.ZERO)
                .todayAmount(todayAmt != null ? todayAmt : BigDecimal.ZERO)
                .cashAmount(cashAmt != null ? cashAmt : BigDecimal.ZERO)
                .bankAmount(bankAmt != null ? bankAmt : BigDecimal.ZERO)
                .upiAmount(upiAmt != null ? upiAmt : BigDecimal.ZERO)
                .otherAmount(otherAmt != null ? otherAmt : BigDecimal.ZERO)
                .totalAllocatedAmount(allocAmt != null ? allocAmt : BigDecimal.ZERO)
                .totalUnallocatedAmount(unallocAmt != null ? unallocAmt : BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OutstandingPurchaseResponse> getOutstandingPurchases(Long partyId, Long businessId) {
        if (partyId == null) {
            return Collections.emptyList();
        }
        Long bizId = businessId != null ? businessId : 1L;
        try {
            List<Purchase> purchases = purchaseRepository.findOutstandingPurchasesByPartyId(bizId, partyId);
            if (purchases == null) {
                return Collections.emptyList();
            }
            return purchases.stream().map(p -> OutstandingPurchaseResponse.builder()
                    .purchaseId(p.getId())
                    .purchaseNumber(p.getPurchaseNumber())
                    .purchaseDate(p.getPurchaseDate())
                    .grandTotal(p.getGrandTotal())
                    .paidAmount(p.getPaidAmount())
                    .balanceAmount(p.getBalanceAmount())
                    .paymentStatus(p.getPaymentStatus())
                    .build()).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Error fetching outstanding purchases for party {}: {}", partyId, ex.getMessage());
            return Collections.emptyList();
        }
    }

    // =========================================================================
    // CANCEL
    // =========================================================================

    @Override
    @Transactional
    public PaymentResponse cancelPayment(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        PaymentTxn payment = paymentTxnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: ID " + id));

        if (payment.getStatus() == PaymentTxnStatus.CANCELLED) {
            throw new BadRequestException("Payment " + payment.getPaymentNumber() + " is already cancelled.");
        }

        // Reverse purchase payment allocations
        List<PaymentAllocation> allocations = paymentAllocationRepository.findByPaymentId(payment.getId());
        for (PaymentAllocation pa : allocations) {
            Purchase purchase = pa.getPurchase();
            if (purchase != null) {
                BigDecimal newPaid = purchase.getPaidAmount().subtract(pa.getAllocatedAmount()).max(BigDecimal.ZERO);
                BigDecimal newBalance = purchase.getGrandTotal().subtract(newPaid);
                purchase.setPaidAmount(newPaid);
                purchase.setBalanceAmount(newBalance);
                purchase.setPaymentStatus(
                        newPaid.compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.PENDING :
                        newBalance.compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL
                );
                purchaseRepository.save(purchase);
                log.info("Reversed payment allocation for purchase {}: restored balance to {}", purchase.getPurchaseNumber(), newBalance);
            }
        }

        payment.setStatus(PaymentTxnStatus.CANCELLED);
        PaymentTxn saved = paymentTxnRepository.save(payment);

        // Reverse from financial ledger
        financialPostingService.reversePayment(saved, principal);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "PAYMENT", "PAYMENT_CANCELLED",
                    saved.getId().toString(),
                    "Cancelled payment " + saved.getPaymentNumber() + " — purchase balances restored",
                    clientIp
            );
        }

        log.info("Payment {} cancelled", saved.getPaymentNumber());
        return toResponse(saved);
    }

    // =========================================================================
    // PDF
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePaymentPdf(Long id, Long businessId) {
        PaymentTxn payment = paymentTxnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: ID " + id));
        if (payment.getAllocations() != null) payment.getAllocations().size(); // force lazy init
        return paymentPdfService.generatePaymentPdf(payment);
    }

    // =========================================================================
    // HELPER — Number Generation
    // =========================================================================

    private synchronized String generateUniquePaymentNumber() {
        Long maxId = paymentTxnRepository.getMaxId();
        long nextSeq = (maxId != null ? maxId : 0L) + 1;
        String candidate;
        int attempts = 0;
        do {
            candidate = String.format("PAY-%06d", nextSeq++);
            attempts++;
            if (attempts > 100) throw new IllegalStateException("Could not generate unique payment number");
        } while (paymentTxnRepository.existsByPaymentNumber(candidate));
        return candidate;
    }

    // =========================================================================
    // MAPPER
    // =========================================================================

    private PaymentResponse toResponse(PaymentTxn payment) {
        Party party = payment.getParty();
        Business biz = payment.getBusiness();

        List<PaymentAllocationResponse> allocResponses = new ArrayList<>();
        if (payment.getAllocations() != null) {
            for (PaymentAllocation pa : payment.getAllocations()) {
                Purchase purchase = pa.getPurchase();
                allocResponses.add(PaymentAllocationResponse.builder()
                        .id(pa.getId())
                        .purchaseId(purchase != null ? purchase.getId() : null)
                        .purchaseNumber(purchase != null ? purchase.getPurchaseNumber() : null)
                        .purchaseDate(purchase != null ? purchase.getPurchaseDate() : null)
                        .purchaseGrandTotal(purchase != null ? purchase.getGrandTotal() : null)
                        .allocatedAmount(pa.getAllocatedAmount())
                        .createdAt(pa.getCreatedAt())
                        .build());
            }
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .paymentNumber(payment.getPaymentNumber())
                // Party
                .partyId(party != null ? party.getId() : null)
                .partyName(party != null ? party.getPartyName() : null)
                .partyCode(party != null ? party.getPartyCode() : null)
                .partyMobile(party != null ? party.getMobile() : null)
                .partyEmail(party != null ? party.getEmail() : null)
                .partyAddress(party != null ? party.getAddress() : null)
                .partyCity(party != null ? party.getCity() : null)
                .partyState(party != null ? party.getState() : null)
                // Business
                .businessName(biz != null ? biz.getBusinessName() : null)
                .businessEmail(biz != null ? biz.getEmail() : null)
                .businessMobile(biz != null ? biz.getMobile() : null)
                // Payment details
                .paymentDate(payment.getPaymentDate())
                .amount(payment.getAmount())
                .paymentMode(payment.getPaymentMode())
                .referenceNumber(payment.getReferenceNumber())
                .allocatedAmount(payment.getAllocatedAmount())
                .unallocatedAmount(payment.getUnallocatedAmount())
                .allocations(allocResponses)
                .notes(payment.getNotes())
                .status(payment.getStatus())
                .createdById(payment.getCreatedBy() != null ? payment.getCreatedBy().getId() : null)
                .createdByName(payment.getCreatedBy() != null ? payment.getCreatedBy().getName() : null)
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
