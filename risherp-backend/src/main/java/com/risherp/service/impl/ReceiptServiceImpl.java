package com.risherp.service.impl;

import com.risherp.dto.receipt.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.ReceiptPdfService;
import com.risherp.service.ReceiptService;
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
 * ReceiptServiceImpl — Phase 14 implementation for Customer Receipts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ReceiptAllocationRepository receiptAllocationRepository;
    private final SaleRepository saleRepository;
    private final PartyRepository partyRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final ReceiptPdfService receiptPdfService;
    private final com.risherp.service.FinancialPostingService financialPostingService;
    private final com.risherp.service.DocumentSequenceService documentSequenceService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @Override
    @Transactional
    public ReceiptResponse createReceipt(CreateReceiptRequest request,
                                         Long businessId,
                                         UserPrincipal principal,
                                         String clientIp) {
        log.info("Creating receipt for partyId={}, businessId={}", request.getPartyId(), businessId);

        // 1. Load business
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        // 2. Load and validate customer party
        Party party = partyRepository.findByIdAndBusinessId(request.getPartyId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: ID " + request.getPartyId()));

        if (party.getStatus() != PartyStatus.ACTIVE) {
            throw new BadRequestException("Customer " + party.getPartyName() + " is inactive.");
        }

        if (party.getPartyType() != PartyType.CUSTOMER && party.getPartyType() != PartyType.BOTH) {
            throw new BadRequestException("Party " + party.getPartyName() + " is not a customer.");
        }

        // 3. Validate receipt amount & date
        BigDecimal receiptAmount = request.getAmount();
        if (receiptAmount == null || receiptAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Receipt amount must be greater than zero.");
        }

        LocalDate receiptDate = request.getReceiptDate() != null ? request.getReceiptDate() : LocalDate.now();
        if (receiptDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Receipt date cannot be in the future.");
        }

        // 4. Generate receipt number using concurrency-safe document sequence mechanism
        String receiptNumber = documentSequenceService.generateNextNumber(businessId, "RECEIPT");

        // 5. Process Allocations
        List<ReceiptAllocation> allocations = new ArrayList<>();
        BigDecimal totalAllocated = BigDecimal.ZERO;

        if (request.getAllocations() != null && !request.getAllocations().isEmpty()) {
            for (ReceiptAllocationRequest allocReq : request.getAllocations()) {
                if (allocReq.getAllocatedAmount() == null || allocReq.getAllocatedAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    continue; // Skip zero/empty allocations
                }

                Sale sale = saleRepository.findByIdAndBusinessId(allocReq.getSaleId(), businessId)
                        .orElseThrow(() -> new ResourceNotFoundException("Sale invoice not found: ID " + allocReq.getSaleId()));

                if (!sale.getParty().getId().equals(party.getId())) {
                    throw new BadRequestException("Invoice " + sale.getInvoiceNumber() + " does not belong to customer " + party.getPartyName());
                }

                if (sale.getStatus() == SaleStatus.CANCELLED) {
                    throw new BadRequestException("Cannot allocate payment to cancelled invoice: " + sale.getInvoiceNumber());
                }

                if (sale.getBalanceAmount().compareTo(BigDecimal.ZERO) <= 0) {
                    throw new BadRequestException("Invoice " + sale.getInvoiceNumber() + " is already fully paid.");
                }

                if (allocReq.getAllocatedAmount().compareTo(sale.getBalanceAmount()) > 0) {
                    throw new BadRequestException(
                            "Allocation amount ₹" + allocReq.getAllocatedAmount() +
                            " exceeds outstanding balance ₹" + sale.getBalanceAmount() +
                            " for invoice " + sale.getInvoiceNumber()
                    );
                }

                // Update sale invoice payment state
                BigDecimal newPaid = sale.getPaidAmount().add(allocReq.getAllocatedAmount());
                BigDecimal newBalance = sale.getGrandTotal().subtract(newPaid).max(BigDecimal.ZERO);
                sale.setPaidAmount(newPaid);
                sale.setBalanceAmount(newBalance);
                sale.setPaymentStatus(newBalance.compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL);
                saleRepository.save(sale);

                // Build allocation
                ReceiptAllocation allocation = ReceiptAllocation.builder()
                        .sale(sale)
                        .allocatedAmount(allocReq.getAllocatedAmount())
                        .build();

                allocations.add(allocation);
                totalAllocated = totalAllocated.add(allocReq.getAllocatedAmount());
            }
        }

        if (totalAllocated.compareTo(receiptAmount) > 0) {
            throw new BadRequestException(
                    "Total allocated amount (₹" + totalAllocated + ") exceeds total receipt amount (₹" + receiptAmount + ")."
            );
        }

        BigDecimal unallocatedAmount = receiptAmount.subtract(totalAllocated).max(BigDecimal.ZERO);

        // 6. Resolve creator
        User createdBy = (principal != null)
                ? userRepository.findById(principal.getId()).orElse(null)
                : null;

        // 7. Build and save Receipt
        Receipt receipt = Receipt.builder()
                .receiptNumber(receiptNumber)
                .party(party)
                .business(business)
                .receiptDate(receiptDate)
                .amount(receiptAmount)
                .paymentMode(request.getPaymentMode())
                .referenceNumber(request.getReferenceNumber())
                .allocatedAmount(totalAllocated)
                .unallocatedAmount(unallocatedAmount)
                .notes(request.getNotes())
                .status(ReceiptStatus.COMPLETED)
                .createdBy(createdBy)
                .build();

        Receipt saved = receiptRepository.save(receipt);

        // 8. Link and save allocations
        for (ReceiptAllocation ra : allocations) {
            ra.setReceipt(saved);
        }
        receiptAllocationRepository.saveAll(allocations);
        saved.getAllocations().addAll(allocations);

        // 9. Post to Financial Ledger
        financialPostingService.postReceipt(saved, principal);

        // 10. Audit log
        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "RECEIPT", "RECEIPT_CREATED",
                    saved.getId().toString(),
                    "Receipt " + receiptNumber + " created for " + party.getPartyName() +
                    " — Amount: ₹" + receiptAmount.toPlainString() + " (" + request.getPaymentMode() + ")",
                    clientIp
            );
        }

        log.info("Receipt created: receiptNumber={}, amount={}, allocated={}", receiptNumber, receiptAmount, totalAllocated);
        return toResponse(saved);
    }

    // =========================================================================
    // READ
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<ReceiptResponse> getReceipts(Long businessId, String search, Long partyId,
                                            String status, PaymentMode paymentMode,
                                            LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Specification<Receipt> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (search != null && !search.trim().isEmpty()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                Predicate numMatch   = cb.like(cb.lower(root.get("receiptNumber")), like);
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
                    predicates.add(cb.equal(root.get("status"), ReceiptStatus.valueOf(status)));
                } catch (IllegalArgumentException ignored) {}
            }
            if (paymentMode != null) {
                predicates.add(cb.equal(root.get("paymentMode"), paymentMode));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("receiptDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("receiptDate"), toDate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Receipt> page = receiptRepository.findAll(spec, pageable);
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptResponse getReceiptById(Long id, Long businessId) {
        Receipt receipt = receiptRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found: ID " + id));
        return toResponse(receipt);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptResponse getReceiptByNumber(String receiptNumber, Long businessId) {
        Receipt receipt = receiptRepository.findByReceiptNumberAndBusinessId(receiptNumber, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found: " + receiptNumber));
        return toResponse(receipt);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptSummaryDTO getReceiptSummary(Long businessId) {
        long total = receiptRepository.countByBusinessId(businessId);
        long completed = receiptRepository.countByBusinessIdAndStatus(businessId, ReceiptStatus.COMPLETED);
        long cancelled = receiptRepository.countByBusinessIdAndStatus(businessId, ReceiptStatus.CANCELLED);
        long today = receiptRepository.countTodayByBusinessId(businessId, LocalDate.now());

        BigDecimal totalAmt = receiptRepository.sumTotalAmountByBusinessId(businessId);
        BigDecimal todayAmt = receiptRepository.sumTodayAmountByBusinessId(businessId, LocalDate.now());
        BigDecimal cashAmt  = receiptRepository.sumCashAmountByBusinessId(businessId);
        BigDecimal bankAmt  = receiptRepository.sumBankAmountByBusinessId(businessId);
        BigDecimal upiAmt   = receiptRepository.sumUpiAmountByBusinessId(businessId);
        BigDecimal otherAmt = receiptRepository.sumOtherAmountByBusinessId(businessId);
        BigDecimal allocAmt = receiptRepository.sumAllocatedAmountByBusinessId(businessId);
        BigDecimal unallocAmt = receiptRepository.sumUnallocatedAmountByBusinessId(businessId);

        return ReceiptSummaryDTO.builder()
                .totalReceipts(total)
                .todayReceipts(today)
                .completedReceipts(completed)
                .cancelledReceipts(cancelled)
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
    public List<OutstandingSaleResponse> getOutstandingSales(Long partyId, Long businessId) {
        if (partyId == null) {
            return Collections.emptyList();
        }
        Long bizId = businessId != null ? businessId : 1L;
        try {
            List<Sale> sales = saleRepository.findOutstandingSalesByPartyId(bizId, partyId);
            if (sales == null) {
                return Collections.emptyList();
            }
            return sales.stream().map(s -> OutstandingSaleResponse.builder()
                    .saleId(s.getId())
                    .invoiceNumber(s.getInvoiceNumber())
                    .saleDate(s.getSaleDate())
                    .grandTotal(s.getGrandTotal())
                    .paidAmount(s.getPaidAmount())
                    .balanceAmount(s.getBalanceAmount())
                    .paymentStatus(s.getPaymentStatus())
                    .build()).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Error fetching outstanding sales for party {}: {}", partyId, ex.getMessage());
            return Collections.emptyList();
        }
    }

    // =========================================================================
    // CANCEL
    // =========================================================================

    @Override
    @Transactional
    public ReceiptResponse cancelReceipt(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        Receipt receipt = receiptRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found: ID " + id));

        if (receipt.getStatus() == ReceiptStatus.CANCELLED) {
            throw new BadRequestException("Receipt " + receipt.getReceiptNumber() + " is already cancelled.");
        }

        // Reverse invoice payment allocations
        List<ReceiptAllocation> allocations = receiptAllocationRepository.findByReceiptId(receipt.getId());
        for (ReceiptAllocation ra : allocations) {
            Sale sale = ra.getSale();
            if (sale != null) {
                BigDecimal newPaid = sale.getPaidAmount().subtract(ra.getAllocatedAmount()).max(BigDecimal.ZERO);
                BigDecimal newBalance = sale.getGrandTotal().subtract(newPaid);
                sale.setPaidAmount(newPaid);
                sale.setBalanceAmount(newBalance);
                sale.setPaymentStatus(
                        newPaid.compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.PENDING :
                        newBalance.compareTo(BigDecimal.ZERO) == 0 ? PaymentStatus.PAID : PaymentStatus.PARTIAL
                );
                saleRepository.save(sale);
                log.info("Reversed receipt allocation for sale {}: restored balance to {}", sale.getInvoiceNumber(), newBalance);
            }
        }

        receipt.setStatus(ReceiptStatus.CANCELLED);
        Receipt saved = receiptRepository.save(receipt);

        // Reverse from financial ledger
        financialPostingService.reverseReceipt(saved, principal);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "RECEIPT", "RECEIPT_CANCELLED",
                    saved.getId().toString(),
                    "Cancelled receipt " + saved.getReceiptNumber() + " — invoice balances restored",
                    clientIp
            );
        }

        log.info("Receipt {} cancelled", saved.getReceiptNumber());
        return toResponse(saved);
    }

    // =========================================================================
    // PDF
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public byte[] generateReceiptPdf(Long id, Long businessId) {
        Receipt receipt = receiptRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found: ID " + id));
        if (receipt.getAllocations() != null) receipt.getAllocations().size(); // force lazy init
        return receiptPdfService.generateReceiptPdf(receipt);
    }

    // =========================================================================
    // HELPER — Number Generation
    // =========================================================================

    private synchronized String generateUniqueReceiptNumber() {
        Long maxId = receiptRepository.getMaxId();
        long nextSeq = (maxId != null ? maxId : 0L) + 1;
        String candidate;
        int attempts = 0;
        do {
            candidate = String.format("REC-%06d", nextSeq++);
            attempts++;
            if (attempts > 100) throw new IllegalStateException("Could not generate unique receipt number");
        } while (receiptRepository.existsByReceiptNumber(candidate));
        return candidate;
    }

    // =========================================================================
    // MAPPER
    // =========================================================================

    private ReceiptResponse toResponse(Receipt receipt) {
        Party party = receipt.getParty();
        Business biz = receipt.getBusiness();

        List<ReceiptAllocationResponse> allocResponses = new ArrayList<>();
        if (receipt.getAllocations() != null) {
            for (ReceiptAllocation ra : receipt.getAllocations()) {
                Sale sale = ra.getSale();
                allocResponses.add(ReceiptAllocationResponse.builder()
                        .id(ra.getId())
                        .saleId(sale != null ? sale.getId() : null)
                        .invoiceNumber(sale != null ? sale.getInvoiceNumber() : null)
                        .saleDate(sale != null ? sale.getSaleDate() : null)
                        .invoiceGrandTotal(sale != null ? sale.getGrandTotal() : null)
                        .allocatedAmount(ra.getAllocatedAmount())
                        .createdAt(ra.getCreatedAt())
                        .build());
            }
        }

        return ReceiptResponse.builder()
                .id(receipt.getId())
                .receiptNumber(receipt.getReceiptNumber())
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
                // Receipt details
                .receiptDate(receipt.getReceiptDate())
                .amount(receipt.getAmount())
                .paymentMode(receipt.getPaymentMode())
                .referenceNumber(receipt.getReferenceNumber())
                .allocatedAmount(receipt.getAllocatedAmount())
                .unallocatedAmount(receipt.getUnallocatedAmount())
                .allocations(allocResponses)
                .notes(receipt.getNotes())
                .status(receipt.getStatus())
                .createdById(receipt.getCreatedBy() != null ? receipt.getCreatedBy().getId() : null)
                .createdByName(receipt.getCreatedBy() != null ? receipt.getCreatedBy().getName() : null)
                .createdAt(receipt.getCreatedAt())
                .updatedAt(receipt.getUpdatedAt())
                .build();
    }
}
