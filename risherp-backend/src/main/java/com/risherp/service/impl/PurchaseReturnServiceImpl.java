package com.risherp.service.impl;

import com.risherp.dto.purchasereturn.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.PurchaseReturnPdfService;
import com.risherp.service.PurchaseReturnService;
import com.risherp.service.StockService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PurchaseReturnServiceImpl — Phase 13 implementation.
 *
 * KEY DESIGN & BUSINESS RULES:
 *   1. All calculations and validations are server-side authoritative.
 *   2. Stock is DECREASED via StockService.decreaseStock() under PESSIMISTIC_WRITE lock.
 *   3. If warehouse stock is insufficient for the return, the transaction is rejected.
 *   4. The entire creation/cancellation runs in a single @Transactional — failure rolls back.
 *   5. Concurrency: cumulative returnable quantity query + write happen in same transaction.
 *
 * RETURN FINANCIAL CALCULATION:
 *   - Proportion = returnQty / originalQty
 *   - Return line total = originalLineTotal × proportion
 *   - Per-line discount = originalDiscountAmount × proportion
 *   - Overall purchase discount allocation = returnSubtotal / originalSubtotal × overallDiscount
 *   - finalReturnAmount = subtotal - overallDiscountAllocated
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseReturnServiceImpl implements PurchaseReturnService {

    private final PurchaseReturnRepository purchaseReturnRepository;
    private final PurchaseReturnItemRepository purchaseReturnItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final StockService stockService;
    private final AuditLogService auditLogService;
    private final PurchaseReturnPdfService purchaseReturnPdfService;
    private final com.risherp.service.FinancialPostingService financialPostingService;
    private final com.risherp.service.DocumentSequenceService documentSequenceService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @Override
    @Transactional
    public PurchaseReturnResponse createPurchaseReturn(CreatePurchaseReturnRequest request,
                                                       Long businessId,
                                                       UserPrincipal principal,
                                                       String clientIp) {
        log.info("Creating purchase return for purchaseId={}, businessId={}", request.getPurchaseId(), businessId);

        // 1. Load business
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        // 2. Load and validate original purchase
        Purchase purchase = purchaseRepository.findByIdAndBusinessId(request.getPurchaseId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: ID " + request.getPurchaseId()));

        if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
            throw new BadRequestException("Purchase return cannot be created for a cancelled purchase: " + purchase.getPurchaseNumber());
        }

        if (purchase.getPurchaseItems() == null || purchase.getPurchaseItems().isEmpty()) {
            throw new BadRequestException("Original purchase has no items.");
        }

        // 3. Validate return date
        LocalDate returnDate = request.getReturnDate() != null ? request.getReturnDate() : LocalDate.now();
        if (returnDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Return date cannot be in the future.");
        }

        // 4. Validate request items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("At least one return item is required.");
        }

        // 5. Generate return number early using concurrency-safe document sequence mechanism
        String returnNumber = documentSequenceService.generateNextNumber(businessId, "PURCHASE_RETURN");

        // 6. Process each return item
        List<PurchaseReturnItem> returnItems = new ArrayList<>();
        BigDecimal computedSubtotal = BigDecimal.ZERO;
        BigDecimal computedItemDiscount = BigDecimal.ZERO;

        for (PurchaseReturnItemRequest itemReq : request.getItems()) {
            // Load original PurchaseItem
            PurchaseItem originalItem = purchaseItemRepository.findByIdAndPurchaseId(itemReq.getPurchaseItemId(), purchase.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Purchase item not found: ID " + itemReq.getPurchaseItemId() + " in purchase " + purchase.getPurchaseNumber()));

            BigDecimal returnQty = itemReq.getReturnQuantity().setScale(3, RoundingMode.HALF_UP);

            if (returnQty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Return quantity must be greater than zero for item: " + originalItem.getItemNameSnapshot());
            }

            // Concurrency-safe cumulative returned query inside same @Transactional
            BigDecimal alreadyReturned = purchaseReturnItemRepository.sumReturnedQuantityByPurchaseItemId(originalItem.getId());
            BigDecimal returnableQty = originalItem.getQuantity().subtract(alreadyReturned).setScale(3, RoundingMode.HALF_UP);

            if (returnableQty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("No returnable quantity remaining for item: " + originalItem.getItemNameSnapshot());
            }

            if (returnQty.compareTo(returnableQty) > 0) {
                throw new BadRequestException(
                        "Return quantity " + returnQty.stripTrailingZeros().toPlainString() +
                        " exceeds remaining returnable quantity " + returnableQty.stripTrailingZeros().toPlainString() +
                        " for item: " + originalItem.getItemNameSnapshot()
                );
            }

            // Calculate return financials using original PurchaseItem data
            BigDecimal origQty = originalItem.getQuantity();
            BigDecimal origLineTotal = originalItem.getLineTotal();       // after per-item discount
            BigDecimal origDiscountAmount = originalItem.getDiscountAmount();

            // Proportion of original qty being returned
            BigDecimal proportion = returnQty.divide(origQty, 10, RoundingMode.HALF_UP);

            // Return line total = proportional share of original lineTotal
            BigDecimal returnLineTotal = origLineTotal.multiply(proportion).setScale(2, RoundingMode.HALF_UP);

            // Per-line discount = proportional share of original discount
            BigDecimal returnDiscountAmount = origDiscountAmount.multiply(proportion).setScale(2, RoundingMode.HALF_UP);

            // Effective rate per unit (from original purchase)
            BigDecimal effectiveRate = origLineTotal.divide(origQty, 2, RoundingMode.HALF_UP);

            computedSubtotal = computedSubtotal.add(returnLineTotal);
            computedItemDiscount = computedItemDiscount.add(returnDiscountAmount);

            // Build return item entity
            PurchaseReturnItem returnItem = PurchaseReturnItem.builder()
                    .purchaseItem(originalItem)
                    .item(originalItem.getItem())
                    .itemNameSnapshot(originalItem.getItemNameSnapshot())
                    .itemCodeSnapshot(originalItem.getItemCodeSnapshot())
                    .unitSnapshot(originalItem.getUnitSnapshot())
                    .originalQuantity(origQty)
                    .alreadyReturnedQuantity(alreadyReturned)
                    .returnQuantity(returnQty)
                    .rate(effectiveRate)
                    .discountAmount(returnDiscountAmount)
                    .lineTotal(returnLineTotal)
                    .build();

            returnItems.add(returnItem);

            // DECREASE stock via StockService (PESSIMISTIC_WRITE lock, rejects if insufficient stock, logs ledger row)
            if (originalItem.getItem() != null && originalItem.getItem().getId() != null) {
                stockService.decreaseStock(
                        businessId,
                        originalItem.getItem().getId(),
                        returnQty,
                        "PURCHASE_RETURN",
                        returnNumber
                );
            }
        }

        // 7. Allocate proportional share of original purchase overall discount
        BigDecimal overallDiscountAllocated = BigDecimal.ZERO;
        if (purchase.getOverallDiscount().compareTo(BigDecimal.ZERO) > 0 && purchase.getSubtotal().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal weight = computedSubtotal.divide(purchase.getSubtotal(), 10, RoundingMode.HALF_UP);
            overallDiscountAllocated = purchase.getOverallDiscount().multiply(weight).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalDiscount = computedItemDiscount.add(overallDiscountAllocated);
        BigDecimal returnAmount = computedSubtotal.subtract(overallDiscountAllocated).max(BigDecimal.ZERO);

        // 8. Financial disposition — default CREDIT_ADJUSTMENT
        RefundMode refundMode = request.getRefundMode() != null ? request.getRefundMode() : RefundMode.CREDIT_ADJUSTMENT;
        BigDecimal refundAmount;
        BigDecimal adjustmentAmount;

        if (refundMode == RefundMode.CREDIT_ADJUSTMENT) {
            refundAmount = BigDecimal.ZERO;
            adjustmentAmount = returnAmount;
        } else {
            // CASH or BANK
            refundAmount = returnAmount;
            adjustmentAmount = BigDecimal.ZERO;
        }

        // 9. Resolve creator
        User createdBy = (principal != null)
                ? userRepository.findById(principal.getId()).orElse(null)
                : null;

        // 10. Build and save PurchaseReturn
        PurchaseReturn purchaseReturn = PurchaseReturn.builder()
                .returnNumber(returnNumber)
                .purchase(purchase)
                .party(purchase.getParty())
                .business(business)
                .returnDate(returnDate)
                .subtotal(computedSubtotal)
                .itemDiscount(computedItemDiscount)
                .overallDiscountAllocated(overallDiscountAllocated)
                .totalDiscount(totalDiscount)
                .returnAmount(returnAmount)
                .refundAmount(refundAmount)
                .adjustmentAmount(adjustmentAmount)
                .refundMode(refundMode)
                .reason(request.getReason())
                .notes(request.getNotes())
                .status(PurchaseReturnStatus.COMPLETED)
                .createdBy(createdBy)
                .build();

        PurchaseReturn saved = purchaseReturnRepository.save(purchaseReturn);

        // 11. Link and save return items
        for (PurchaseReturnItem pri : returnItems) {
            pri.setPurchaseReturn(saved);
        }
        purchaseReturnItemRepository.saveAll(returnItems);
        saved.getReturnItems().addAll(returnItems);

        // 10. Post to Financial Ledger
        financialPostingService.postPurchaseReturn(saved, principal);

        // 11. Audit log
        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "PURCHASE_RETURN", "PURCHASE_RETURN_CREATED",
                    saved.getId().toString(),
                    "Purchase Return " + returnNumber + " created against " + purchase.getPurchaseNumber() +
                    " — Return Amount: ₹" + returnAmount.toPlainString(),
                    clientIp
            );
        }

        log.info("Purchase return created: returnNumber={}, returnAmount={}", returnNumber, returnAmount);
        return toResponse(saved);
    }

    // =========================================================================
    // READ
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseReturnResponse> getPurchaseReturns(Long businessId, String search, Long partyId,
                                                          String status, LocalDate fromDate, LocalDate toDate,
                                                          Pageable pageable) {
        Specification<PurchaseReturn> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (search != null && !search.trim().isEmpty()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                Predicate numMatch   = cb.like(cb.lower(root.get("returnNumber")), like);
                Predicate purMatch   = cb.like(cb.lower(root.get("purchase").get("purchaseNumber")), like);
                Predicate partyMatch = cb.like(cb.lower(root.get("party").get("partyName")), like);
                Predicate codeMatch  = cb.like(cb.lower(root.get("party").get("partyCode")), like);
                predicates.add(cb.or(numMatch, purMatch, partyMatch, codeMatch));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                try {
                    predicates.add(cb.equal(root.get("status"), PurchaseReturnStatus.valueOf(status)));
                } catch (IllegalArgumentException ignored) {}
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("returnDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("returnDate"), toDate));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PurchaseReturn> page = purchaseReturnRepository.findAll(spec, pageable);
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseReturnResponse getPurchaseReturnById(Long id, Long businessId) {
        PurchaseReturn pr = purchaseReturnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase return not found: ID " + id));
        return toResponse(pr);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseReturnResponse getPurchaseReturnByNumber(String returnNumber, Long businessId) {
        PurchaseReturn pr = purchaseReturnRepository.findByReturnNumberAndBusinessId(returnNumber, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase return not found: " + returnNumber));
        return toResponse(pr);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseReturnResponse> getPurchaseReturnsByPurchase(Long purchaseId, Long businessId) {
        return purchaseReturnRepository.findByPurchaseIdAndBusinessId(purchaseId, businessId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnablePurchaseItemResponse> getReturnableItems(Long purchaseId, Long businessId) {
        Purchase purchase = purchaseRepository.findByIdAndBusinessId(purchaseId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: ID " + purchaseId));

        return purchase.getPurchaseItems().stream().map(pi -> {
            BigDecimal alreadyReturned = purchaseReturnItemRepository.sumReturnedQuantityByPurchaseItemId(pi.getId());
            BigDecimal returnableQty = pi.getQuantity().subtract(alreadyReturned).max(BigDecimal.ZERO);
            return ReturnablePurchaseItemResponse.builder()
                    .purchaseItemId(pi.getId())
                    .itemId(pi.getItem() != null ? pi.getItem().getId() : null)
                    .itemNameSnapshot(pi.getItemNameSnapshot())
                    .itemCodeSnapshot(pi.getItemCodeSnapshot())
                    .unitSnapshot(pi.getUnitSnapshot())
                    .originalQuantity(pi.getQuantity())
                    .rate(pi.getRate())
                    .discountAmount(pi.getDiscountAmount())
                    .lineTotal(pi.getLineTotal())
                    .alreadyReturnedQuantity(alreadyReturned)
                    .returnableQuantity(returnableQty)
                    .fullyReturned(returnableQty.compareTo(BigDecimal.ZERO) <= 0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseReturnSummaryDTO getPurchaseReturnSummary(Long businessId) {
        long total = purchaseReturnRepository.countByBusinessId(businessId);
        long completed = purchaseReturnRepository.countByBusinessIdAndStatus(businessId, PurchaseReturnStatus.COMPLETED);
        long cancelled = purchaseReturnRepository.countByBusinessIdAndStatus(businessId, PurchaseReturnStatus.CANCELLED);
        long today = purchaseReturnRepository.countTodayByBusinessId(businessId, LocalDate.now());

        BigDecimal totalReturnAmt = purchaseReturnRepository.sumReturnAmountByBusinessId(businessId);
        BigDecimal totalRefund = purchaseReturnRepository.sumRefundAmountByBusinessId(businessId);
        BigDecimal totalAdj = purchaseReturnRepository.sumAdjustmentAmountByBusinessId(businessId);

        return PurchaseReturnSummaryDTO.builder()
                .totalReturns(total)
                .completedReturns(completed)
                .cancelledReturns(cancelled)
                .todayReturns(today)
                .totalReturnAmount(totalReturnAmt != null ? totalReturnAmt : BigDecimal.ZERO)
                .totalRefundAmount(totalRefund != null ? totalRefund : BigDecimal.ZERO)
                .totalAdjustmentAmount(totalAdj != null ? totalAdj : BigDecimal.ZERO)
                .build();
    }

    // =========================================================================
    // CANCEL
    // =========================================================================

    @Override
    @Transactional
    public PurchaseReturnResponse cancelPurchaseReturn(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        PurchaseReturn pr = purchaseReturnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase return not found: ID " + id));

        if (pr.getStatus() == PurchaseReturnStatus.CANCELLED) {
            throw new BadRequestException("Purchase return " + pr.getReturnNumber() + " is already cancelled.");
        }

        // Reverse stock decreases (increase stock back)
        List<PurchaseReturnItem> items = purchaseReturnItemRepository.findByPurchaseReturnId(pr.getId());
        for (PurchaseReturnItem ri : items) {
            if (ri.getItem() != null && ri.getItem().getId() != null) {
                log.info("Restoring returned stock for item: {} by {}", ri.getItemNameSnapshot(), ri.getReturnQuantity());
                stockService.increaseStock(
                        businessId,
                        ri.getItem().getId(),
                        ri.getReturnQuantity(),
                        "PURCHASE_RETURN_CANCEL",
                        pr.getReturnNumber()
                );
            }
        }

        pr.setStatus(PurchaseReturnStatus.CANCELLED);
        PurchaseReturn saved = purchaseReturnRepository.save(pr);

        // Reverse from financial ledger
        financialPostingService.reversePurchaseReturn(saved, principal);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "PURCHASE_RETURN", "PURCHASE_RETURN_CANCELLED",
                    saved.getId().toString(),
                    "Cancelled purchase return " + saved.getReturnNumber() + " — stock restored",
                    clientIp
            );
        }

        log.info("Purchase return {} cancelled", saved.getReturnNumber());
        return toResponse(saved);
    }

    // =========================================================================
    // PDF
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePurchaseReturnPdf(Long id, Long businessId) {
        PurchaseReturn pr = purchaseReturnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase return not found: ID " + id));
        if (pr.getReturnItems() != null) pr.getReturnItems().size(); // force lazy init
        return purchaseReturnPdfService.generatePurchaseReturnPdf(pr);
    }

    // =========================================================================
    // HELPER — Return Number Generation
    // =========================================================================

    private synchronized String generateUniqueReturnNumber() {
        Long maxId = purchaseReturnRepository.getMaxId();
        long nextSeq = (maxId != null ? maxId : 0L) + 1;
        String candidate;
        int attempts = 0;
        do {
            candidate = String.format("PR-%06d", nextSeq++);
            attempts++;
            if (attempts > 100) throw new IllegalStateException("Could not generate unique return number");
        } while (purchaseReturnRepository.existsByReturnNumber(candidate));
        return candidate;
    }

    // =========================================================================
    // MAPPER
    // =========================================================================

    private PurchaseReturnResponse toResponse(PurchaseReturn pr) {
        Purchase purchase = pr.getPurchase();
        Party party = pr.getParty();
        Business biz = pr.getBusiness();

        List<PurchaseReturnItemResponse> itemResponses = new ArrayList<>();
        if (pr.getReturnItems() != null) {
            for (PurchaseReturnItem ri : pr.getReturnItems()) {
                itemResponses.add(PurchaseReturnItemResponse.builder()
                        .id(ri.getId())
                        .purchaseItemId(ri.getPurchaseItem() != null ? ri.getPurchaseItem().getId() : null)
                        .itemId(ri.getItem() != null ? ri.getItem().getId() : null)
                        .itemNameSnapshot(ri.getItemNameSnapshot())
                        .itemCodeSnapshot(ri.getItemCodeSnapshot())
                        .unitSnapshot(ri.getUnitSnapshot())
                        .originalQuantity(ri.getOriginalQuantity())
                        .alreadyReturnedQuantity(ri.getAlreadyReturnedQuantity())
                        .returnQuantity(ri.getReturnQuantity())
                        .rate(ri.getRate())
                        .discountAmount(ri.getDiscountAmount())
                        .lineTotal(ri.getLineTotal())
                        .createdAt(ri.getCreatedAt())
                        .build());
            }
        }

        return PurchaseReturnResponse.builder()
                .id(pr.getId())
                .returnNumber(pr.getReturnNumber())
                // Purchase reference
                .purchaseId(purchase != null ? purchase.getId() : null)
                .purchaseNumber(purchase != null ? purchase.getPurchaseNumber() : null)
                .purchaseDate(purchase != null ? purchase.getPurchaseDate() : null)
                // Supplier
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
                // Return info
                .returnDate(pr.getReturnDate())
                // Financial
                .subtotal(pr.getSubtotal())
                .itemDiscount(pr.getItemDiscount())
                .overallDiscountAllocated(pr.getOverallDiscountAllocated())
                .totalDiscount(pr.getTotalDiscount())
                .returnAmount(pr.getReturnAmount())
                .refundAmount(pr.getRefundAmount())
                .adjustmentAmount(pr.getAdjustmentAmount())
                .refundMode(pr.getRefundMode())
                // Items
                .items(itemResponses)
                // Meta
                .reason(pr.getReason())
                .notes(pr.getNotes())
                .status(pr.getStatus())
                .createdById(pr.getCreatedBy() != null ? pr.getCreatedBy().getId() : null)
                .createdByName(pr.getCreatedBy() != null ? pr.getCreatedBy().getName() : null)
                .createdAt(pr.getCreatedAt())
                .updatedAt(pr.getUpdatedAt())
                .build();
    }
}
