package com.risherp.service.impl;

import com.risherp.dto.purchase.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.PurchasePdfService;
import com.risherp.service.PurchaseService;
import com.risherp.service.StockService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseServiceImpl implements PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final PartyRepository partyRepository;
    private final ItemRepository itemRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final StockService stockService;
    private final PurchasePdfService purchasePdfService;
    private final AuditLogService auditLogService;
    private final com.risherp.service.FinancialPostingService financialPostingService;
    private final com.risherp.service.DocumentSequenceService documentSequenceService;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public PurchaseResponse createPurchase(CreatePurchaseRequest request, Long businessId, UserPrincipal principal) {
        log.info("Starting purchase creation for businessId: {}, supplierId: {}", businessId, request.getPartyId());

        // 1. Resolve business
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        // 2. Validate Supplier
        Party party = partyRepository.findByIdAndBusinessId(request.getPartyId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + request.getPartyId()));

        if (party.getStatus() != PartyStatus.ACTIVE) {
            throw new BadRequestException("Supplier '" + party.getPartyName() + "' is inactive. Cannot create purchase.");
        }

        if (party.getPartyType() != PartyType.SUPPLIER && party.getPartyType() != PartyType.BOTH) {
            throw new BadRequestException("Party '" + party.getPartyName() + "' is not a supplier. Type: " + party.getPartyType());
        }

        // 3. Validate items
        List<PurchaseItemRequest> itemRequests = request.getItems();
        if (itemRequests == null || itemRequests.isEmpty()) {
            throw new BadRequestException("At least one purchase item is required.");
        }

        // 4. Generate unique purchase number using concurrency-safe document sequence mechanism
        String purchaseNumber = documentSequenceService.generateNextNumber(businessId, "PURCHASE");

        // 5. Process items, calculate line amounts, and increase stock atomically
        List<PurchaseItem> purchaseItems = new ArrayList<>();
        BigDecimal computedSubtotal = BigDecimal.ZERO;
        BigDecimal computedItemDiscount = BigDecimal.ZERO;

        for (PurchaseItemRequest itemReq : itemRequests) {
            Item item = itemRepository.findByIdAndBusinessId(itemReq.getItemId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemReq.getItemId()));

            if (item.getStatus() != ItemStatus.ACTIVE) {
                throw new BadRequestException("Item '" + item.getItemName() + "' is inactive. Cannot add to purchase.");
            }

            BigDecimal qty = itemReq.getQuantity().setScale(3, RoundingMode.HALF_UP);
            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Quantity must be greater than zero for item: " + item.getItemName());
            }

            BigDecimal rate = itemReq.getRate().setScale(2, RoundingMode.HALF_UP);
            if (rate.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Purchase rate cannot be negative for item: " + item.getItemName());
            }

            // Line subtotal
            BigDecimal lineSubtotal = qty.multiply(rate).setScale(2, RoundingMode.HALF_UP);

            DiscountType discountType = itemReq.getDiscountType() != null ? itemReq.getDiscountType() : DiscountType.AMOUNT;
            BigDecimal discountValue = itemReq.getDiscountValue() != null ? itemReq.getDiscountValue() : BigDecimal.ZERO;
            BigDecimal discountAmount;

            if (discountType == DiscountType.PERCENTAGE) {
                if (discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                    throw new BadRequestException("Discount percentage cannot exceed 100% for item: " + item.getItemName());
                }
                discountAmount = lineSubtotal.multiply(discountValue).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                discountAmount = discountValue.setScale(2, RoundingMode.HALF_UP);
                if (discountAmount.compareTo(lineSubtotal) > 0) {
                    throw new BadRequestException("Discount amount cannot exceed line subtotal for item: " + item.getItemName());
                }
            }

            BigDecimal lineTotal = lineSubtotal.subtract(discountAmount);
            computedSubtotal = computedSubtotal.add(lineTotal);
            computedItemDiscount = computedItemDiscount.add(discountAmount);

            // Atomically increase stock via StockService with concurrency lock
            stockService.increaseStock(businessId, item.getId(), qty, "PURCHASE", purchaseNumber);

            // Create PurchaseItem entity with historical snapshot
            PurchaseItem purchaseItem = PurchaseItem.builder()
                    .item(item)
                    .itemNameSnapshot(item.getItemName())
                    .itemCodeSnapshot(item.getItemCode())
                    .unitSnapshot(item.getUnit())
                    .quantity(qty)
                    .rate(rate)
                    .discountType(discountType)
                    .discountValue(discountValue)
                    .discountAmount(discountAmount)
                    .taxAmount(BigDecimal.ZERO)
                    .lineSubtotal(lineSubtotal)
                    .lineTotal(lineTotal)
                    .build();

            purchaseItems.add(purchaseItem);
        }

        // 6. Overall Discount calculation
        BigDecimal overallDiscountAmount = BigDecimal.ZERO;
        if (request.getOverallDiscount() != null && request.getOverallDiscount().compareTo(BigDecimal.ZERO) > 0) {
            if (request.getOverallDiscountType() == DiscountType.PERCENTAGE) {
                if (request.getOverallDiscount().compareTo(BigDecimal.valueOf(100)) > 0) {
                    throw new BadRequestException("Overall discount percentage cannot exceed 100%");
                }
                overallDiscountAmount = computedSubtotal.multiply(request.getOverallDiscount())
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            } else {
                overallDiscountAmount = request.getOverallDiscount().setScale(2, RoundingMode.HALF_UP);
                if (overallDiscountAmount.compareTo(computedSubtotal) > 0) {
                    throw new BadRequestException("Overall discount cannot exceed subtotal.");
                }
            }
        }

        BigDecimal totalDiscount = computedItemDiscount.add(overallDiscountAmount);
        BigDecimal grandTotal = computedSubtotal.subtract(overallDiscountAmount).max(BigDecimal.ZERO);

        // 7. Payment validation
        BigDecimal paidAmount = request.getPaidAmount() != null ? request.getPaidAmount().setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        if (paidAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Paid amount cannot be negative.");
        }

        if (paidAmount.compareTo(grandTotal) > 0) {
            throw new BadRequestException("Paid amount cannot exceed grand total of ₹" + grandTotal.toPlainString());
        }

        PaymentStatus paymentStatus;
        if (paidAmount.compareTo(grandTotal) == 0 && grandTotal.compareTo(BigDecimal.ZERO) > 0) {
            paymentStatus = PaymentStatus.PAID;
        } else if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            paymentStatus = PaymentStatus.PARTIAL;
        } else {
            paymentStatus = PaymentStatus.PENDING;
        }

        BigDecimal balanceAmount = grandTotal.subtract(paidAmount);

        // 8. Creator user
        User createdBy = (principal != null)
                ? userRepository.findById(principal.getId()).orElse(null)
                : null;

        // 9. Build and save Purchase
        LocalDate purchaseDate = request.getPurchaseDate() != null ? request.getPurchaseDate() : LocalDate.now();

        Purchase purchase = Purchase.builder()
                .business(business)
                .purchaseNumber(purchaseNumber)
                .party(party)
                .purchaseDate(purchaseDate)
                .purchaseType(request.getPurchaseType())
                .subtotal(computedSubtotal)
                .itemDiscount(computedItemDiscount)
                .overallDiscount(overallDiscountAmount)
                .totalDiscount(totalDiscount)
                .grandTotal(grandTotal)
                .paidAmount(paidAmount)
                .balanceAmount(balanceAmount)
                .paymentStatus(paymentStatus)
                .paymentMode(paidAmount.compareTo(BigDecimal.ZERO) > 0 ? request.getPaymentMode() : null)
                .notes(request.getNotes())
                .status(PurchaseStatus.COMPLETED)
                .createdBy(createdBy)
                .build();

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // 10. Link and save Purchase Items
        for (PurchaseItem pi : purchaseItems) {
            pi.setPurchase(savedPurchase);
        }
        purchaseItemRepository.saveAll(purchaseItems);
        savedPurchase.getPurchaseItems().addAll(purchaseItems);

        // 11. Audit log
        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "PURCHASE",
                    "PURCHASE_CREATED",
                    savedPurchase.getId().toString(),
                    "Created purchase " + purchaseNumber + " from " + party.getPartyName() + " — Grand Total: ₹" + grandTotal.toPlainString(),
                    null
            );
        }

        // Post to Financial Ledger
        financialPostingService.postPurchase(savedPurchase, principal);

        log.info("Purchase created successfully: purchaseNumber={}, grandTotal={}, paymentStatus={}",
                purchaseNumber, grandTotal, paymentStatus);

        return toResponse(savedPurchase);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id, Long businessId) {
        Purchase purchase = purchaseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return toResponse(purchase);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseByNumber(String purchaseNumber, Long businessId) {
        Purchase purchase = purchaseRepository.findByPurchaseNumberAndBusinessId(purchaseNumber, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with number: " + purchaseNumber));
        return toResponse(purchase);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseResponse> getPurchases(Long businessId, String search, LocalDate fromDate, LocalDate toDate,
                                               Long partyId, PaymentStatus paymentStatus, PurchaseStatus status, Pageable pageable) {
        Specification<Purchase> spec = (root, query, cb) -> {
            List<Predicate> predicates = buildPredicates(cb, root, businessId, search, partyId, paymentStatus, status, fromDate, toDate);
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return purchaseRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseResponse> getSupplierPurchases(Long partyId, Long businessId, Pageable pageable) {
        return purchaseRepository.findByBusinessIdAndPartyId(businessId, partyId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseSummaryDTO getPurchaseSummary(Long businessId, String search, Long partyId, PaymentStatus paymentStatus,
                                                 PurchaseStatus status, LocalDate fromDate, LocalDate toDate) {
        boolean hasFilter = (search != null && !search.trim().isEmpty())
                || partyId != null
                || paymentStatus != null
                || status != null
                || fromDate != null
                || toDate != null;

        if (!hasFilter) {
            return getPurchaseSummary(businessId);
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // 1. Aggregates: Total Count, Sum Grand Total, Sum Paid Amount, Sum Balance Amount
        CriteriaQuery<Object[]> cq = cb.createQuery(Object[].class);
        Root<Purchase> root = cq.from(Purchase.class);
        List<Predicate> predicates = buildPredicates(cb, root, businessId, search, partyId, paymentStatus, status, fromDate, toDate);
        cq.where(cb.and(predicates.toArray(new Predicate[0])));
        cq.multiselect(
                cb.count(root),
                cb.coalesce(cb.sum(root.get("grandTotal")), BigDecimal.ZERO),
                cb.coalesce(cb.sum(root.get("paidAmount")), BigDecimal.ZERO),
                cb.coalesce(cb.sum(root.get("balanceAmount")), BigDecimal.ZERO)
        );

        Object[] aggResult = entityManager.createQuery(cq).getSingleResult();
        long totalCount = ((Number) aggResult[0]).longValue();
        BigDecimal totalPurchases = (BigDecimal) aggResult[1];
        BigDecimal totalPaid = (BigDecimal) aggResult[2];
        BigDecimal totalOutstanding = (BigDecimal) aggResult[3];

        // 2. Payment Status counts (PAID, PARTIAL, PENDING)
        CriteriaQuery<Object[]> groupCq = cb.createQuery(Object[].class);
        Root<Purchase> groupRoot = groupCq.from(Purchase.class);
        List<Predicate> groupPreds = buildPredicates(cb, groupRoot, businessId, search, partyId, paymentStatus, status, fromDate, toDate);
        groupCq.where(cb.and(groupPreds.toArray(new Predicate[0])));
        groupCq.multiselect(groupRoot.get("paymentStatus"), cb.count(groupRoot));
        groupCq.groupBy(groupRoot.get("paymentStatus"));

        List<Object[]> groupResults = entityManager.createQuery(groupCq).getResultList();
        long paid = 0, partial = 0, pending = 0;
        for (Object[] row : groupResults) {
            PaymentStatus ps = (PaymentStatus) row[0];
            long count = ((Number) row[1]).longValue();
            if (ps == PaymentStatus.PAID) paid = count;
            else if (ps == PaymentStatus.PARTIAL) partial = count;
            else if (ps == PaymentStatus.PENDING) pending = count;
        }

        // 3. Today's stats
        LocalDate today = LocalDate.now();
        long todayCount = purchaseRepository.countTodayByBusinessId(businessId, today);
        BigDecimal todayAmount = purchaseRepository.sumTodayPurchasesByBusinessId(businessId, today);

        return PurchaseSummaryDTO.builder()
                .totalInvoices(totalCount)
                .totalPurchases(totalPurchases)
                .totalPurchasesAmount(totalPurchases)
                .totalPaid(totalPaid)
                .totalOutstanding(totalOutstanding)
                .totalBalance(totalOutstanding)
                .paidCount(paid)
                .partialCount(partial)
                .pendingCount(pending)
                .todayPurchasesCount(todayCount)
                .todayPurchasesAmount(todayAmount != null ? todayAmount : BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseSummaryDTO getPurchaseSummary(Long businessId) {
        long totalPurchases = purchaseRepository.countByBusinessId(businessId);
        long paidCount = purchaseRepository.countByBusinessIdAndPaymentStatus(businessId, PaymentStatus.PAID);
        long partialCount = purchaseRepository.countByBusinessIdAndPaymentStatus(businessId, PaymentStatus.PARTIAL);
        long pendingCount = purchaseRepository.countByBusinessIdAndPaymentStatus(businessId, PaymentStatus.PENDING);

        BigDecimal totalGrandTotal = purchaseRepository.sumGrandTotalByBusinessId(businessId);
        BigDecimal totalPaid = purchaseRepository.sumPaidAmountByBusinessId(businessId);
        BigDecimal totalBalance = purchaseRepository.sumBalanceAmountByBusinessId(businessId);

        LocalDate today = LocalDate.now();
        long todayCount = purchaseRepository.countTodayByBusinessId(businessId, today);
        BigDecimal todayAmount = purchaseRepository.sumTodayPurchasesByBusinessId(businessId, today);

        return PurchaseSummaryDTO.builder()
                .totalInvoices(totalPurchases)
                .totalPurchases(totalGrandTotal != null ? totalGrandTotal : BigDecimal.ZERO)
                .totalPurchasesAmount(totalGrandTotal != null ? totalGrandTotal : BigDecimal.ZERO)
                .totalPaid(totalPaid != null ? totalPaid : BigDecimal.ZERO)
                .totalOutstanding(totalBalance != null ? totalBalance : BigDecimal.ZERO)
                .totalBalance(totalBalance != null ? totalBalance : BigDecimal.ZERO)
                .paidCount(paidCount)
                .partialCount(partialCount)
                .pendingCount(pendingCount)
                .todayPurchasesCount(todayCount)
                .todayPurchasesAmount(todayAmount != null ? todayAmount : BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional
    public PurchaseResponse cancelPurchase(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Attempting cancellation of purchase id: {} for businessId: {}", id, businessId);

        Purchase purchase = purchaseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        if (purchase.getStatus() == PurchaseStatus.CANCELLED) {
            throw new BadRequestException("Purchase " + purchase.getPurchaseNumber() + " is already cancelled.");
        }

        // Reverse stock additions atomically for each item using pessimistic lock
        List<PurchaseItem> items = purchase.getPurchaseItems();
        if (items != null) {
            for (PurchaseItem pi : items) {
                if (pi.getItem() != null && pi.getItem().getId() != null) {
                    BigDecimal qty = pi.getQuantity();
                    log.info("Reversing purchase stock for item: {} (ID: {}) by {} {}",
                            pi.getItemNameSnapshot(), pi.getItem().getId(), qty, pi.getUnitSnapshot());
                    stockService.decreaseStock(businessId, pi.getItem().getId(), qty, "PURCHASE_CANCEL", purchase.getPurchaseNumber());
                }
            }
        }

        purchase.setStatus(PurchaseStatus.CANCELLED);
        Purchase saved = purchaseRepository.save(purchase);

        // Reverse from financial ledger
        financialPostingService.reversePurchase(saved, principal);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "PURCHASE",
                    "PURCHASE_CANCELLED",
                    saved.getId().toString(),
                    "Cancelled purchase " + saved.getPurchaseNumber() + " from " +
                            (saved.getParty() != null ? saved.getParty().getPartyName() : "Supplier") +
                            " and reversed stock additions",
                    clientIp
            );
        }

        log.info("Purchase {} cancelled successfully", saved.getPurchaseNumber());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePurchasePdf(Long id, Long businessId) {
        Purchase purchase = purchaseRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        // Force initialization of lazy relationships
        if (purchase.getPurchaseItems() != null) {
            purchase.getPurchaseItems().size();
        }

        return purchasePdfService.generatePurchasePdf(purchase);
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Purchase> root, Long businessId, String search,
                                            Long partyId, PaymentStatus paymentStatus, PurchaseStatus status,
                                            LocalDate fromDate, LocalDate toDate) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("business").get("id"), businessId));

        if (search != null && !search.trim().isEmpty()) {
            String searchLower = "%" + search.trim().toLowerCase() + "%";
            Predicate numMatch = cb.like(cb.lower(root.get("purchaseNumber")), searchLower);
            Predicate supplierNameMatch = cb.like(cb.lower(root.get("party").get("partyName")), searchLower);
            Predicate supplierMobileMatch = cb.like(cb.lower(root.get("party").get("mobile")), searchLower);
            Predicate supplierCodeMatch = cb.like(cb.lower(root.get("party").get("partyCode")), searchLower);
            predicates.add(cb.or(numMatch, supplierNameMatch, supplierMobileMatch, supplierCodeMatch));
        }

        if (partyId != null) {
            predicates.add(cb.equal(root.get("party").get("id"), partyId));
        }

        if (paymentStatus != null) {
            predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
        }

        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }

        if (fromDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), fromDate));
        }
        if (toDate != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), toDate));
        }

        return predicates;
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private synchronized String generateUniquePurchaseNumber() {
        Long maxId = purchaseRepository.getMaxId();
        long nextNum = (maxId != null ? maxId : 0) + 1;
        String purchaseNumber = String.format("PUR-%06d", nextNum);

        while (purchaseRepository.existsByPurchaseNumber(purchaseNumber)) {
            nextNum++;
            purchaseNumber = String.format("PUR-%06d", nextNum);
        }
        return purchaseNumber;
    }

    private PurchaseResponse toResponse(Purchase purchase) {
        Party party = purchase.getParty();
        Business biz = purchase.getBusiness();
        List<PurchaseItemResponse> itemResponses = purchase.getPurchaseItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        return PurchaseResponse.builder()
                .id(purchase.getId())
                .purchaseNumber(purchase.getPurchaseNumber())
                .partyId(party != null ? party.getId() : null)
                .partyName(party != null ? party.getPartyName() : null)
                .partyCode(party != null ? party.getPartyCode() : null)
                .partyMobile(party != null ? party.getMobile() : null)
                .partyEmail(party != null ? party.getEmail() : null)
                .partyAddress(party != null ? party.getAddress() : null)
                .partyCity(party != null ? party.getCity() : null)
                .partyState(party != null ? party.getState() : null)
                .partyPincode(party != null ? party.getPincode() : null)
                .businessName(biz != null ? biz.getBusinessName() : null)
                .businessEmail(biz != null ? biz.getEmail() : null)
                .businessMobile(biz != null ? biz.getMobile() : null)
                .purchaseDate(purchase.getPurchaseDate())
                .purchaseType(purchase.getPurchaseType())
                .subtotal(purchase.getSubtotal())
                .itemDiscount(purchase.getItemDiscount())
                .overallDiscount(purchase.getOverallDiscount())
                .totalDiscount(purchase.getTotalDiscount())
                .grandTotal(purchase.getGrandTotal())
                .paidAmount(purchase.getPaidAmount())
                .balanceAmount(purchase.getBalanceAmount())
                .paymentStatus(purchase.getPaymentStatus())
                .paymentMode(purchase.getPaymentMode())
                .items(itemResponses)
                .notes(purchase.getNotes())
                .status(purchase.getStatus())
                .createdById(purchase.getCreatedBy() != null ? purchase.getCreatedBy().getId() : null)
                .createdByName(purchase.getCreatedBy() != null ? purchase.getCreatedBy().getName() : null)
                .createdAt(purchase.getCreatedAt())
                .updatedAt(purchase.getUpdatedAt())
                .build();
    }

    private PurchaseItemResponse toItemResponse(PurchaseItem pi) {
        return PurchaseItemResponse.builder()
                .id(pi.getId())
                .itemId(pi.getItem() != null ? pi.getItem().getId() : null)
                .itemNameSnapshot(pi.getItemNameSnapshot())
                .itemCodeSnapshot(pi.getItemCodeSnapshot())
                .unitSnapshot(pi.getUnitSnapshot())
                .quantity(pi.getQuantity())
                .rate(pi.getRate())
                .discountType(pi.getDiscountType())
                .discountValue(pi.getDiscountValue())
                .discountAmount(pi.getDiscountAmount())
                .taxAmount(pi.getTaxAmount())
                .lineSubtotal(pi.getLineSubtotal())
                .lineTotal(pi.getLineTotal())
                .createdAt(pi.getCreatedAt())
                .build();
    }
}
