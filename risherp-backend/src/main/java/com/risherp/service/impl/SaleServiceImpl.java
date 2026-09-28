package com.risherp.service.impl;

import com.risherp.dto.sales.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.InvoicePdfService;
import com.risherp.service.SaleService;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * SaleServiceImpl — Enterprise implementation of SaleService.
 *
 * TRANSACTION SAFETY:
 *   createSale() is fully @Transactional. All operations (validate, recalculate,
 *   generate invoice#, save sale, save items, deduct stock) happen in ONE atomic unit.
 *   If any step fails the entire transaction rolls back — no partial data is committed.
 *
 * CONCURRENCY:
 *   Stock deduction uses findByIdAndBusinessIdWithLock() which acquires a PESSIMISTIC_WRITE
 *   (exclusive row-level) lock on each Item row. Concurrent sales for the same item serialize
 *   at the lock point. The second thread sees the already-updated stock and correctly rejects
 *   over-sell attempts.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SaleServiceImpl implements SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ItemRepository itemRepository;
    private final PartyRepository partyRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final InvoicePdfService invoicePdfService;
    private final StockService stockService;
    private final com.risherp.service.FinancialPostingService financialPostingService;
    private final com.risherp.service.DocumentSequenceService documentSequenceService;

    @PersistenceContext
    private EntityManager entityManager;

    // =========================================================================
    // CREATE SALE
    // =========================================================================

    @Override
    @Transactional
    public SaleResponse createSale(CreateSaleRequest request, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Creating sale for partyId={}, businessId={}, items={}", request.getPartyId(), businessId, request.getItems().size());

        // 1. Validate Business
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        // 2. Validate Customer
        Party party = partyRepository.findByIdAndBusinessId(request.getPartyId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        if (party.getStatus() != PartyStatus.ACTIVE) {
            throw new BadRequestException("Selected customer is inactive. Cannot create a sale.");
        }
        if (party.getPartyType() == PartyType.SUPPLIER) {
            throw new BadRequestException("Selected party is a Supplier-only. Cannot use as customer in sales.");
        }

        // 3. Validate items list
        List<SaleItemRequest> itemRequests = request.getItems();
        if (itemRequests == null || itemRequests.isEmpty()) {
            throw new BadRequestException("At least one item is required");
        }

        // Generate invoice number early using concurrency-safe document sequence mechanism
        String invoiceNumber = documentSequenceService.generateNextNumber(businessId, "SALES_INVOICE");

        List<SaleItem> saleItems = new ArrayList<>();
        BigDecimal computedSubtotal = BigDecimal.ZERO;
        BigDecimal computedItemDiscount = BigDecimal.ZERO;

        for (SaleItemRequest itemReq : itemRequests) {
            // Read item for validation (non-locking read is fine here;
            // stockService.decreaseStock re-acquires PESSIMISTIC_WRITE lock atomically)
            Item item = itemRepository.findByIdAndBusinessId(itemReq.getItemId(), businessId)
                    .orElseThrow(() -> new ResourceNotFoundException("Item not found: ID " + itemReq.getItemId()));

            if (item.getStatus() != ItemStatus.ACTIVE) {
                throw new BadRequestException("Item '" + item.getItemName() + "' is inactive. Cannot add to sale.");
            }

            BigDecimal qty = itemReq.getQuantity().setScale(3, RoundingMode.HALF_UP);
            BigDecimal rate = itemReq.getRate().setScale(2, RoundingMode.HALF_UP);

            // Stock sufficiency pre-check (non-locking) — firm rejection before hitting the lock
            if (item.getCurrentStock().compareTo(qty) < 0) {
                throw new BadRequestException(
                    "Insufficient stock for '" + item.getItemName() + "'. " +
                    "Available: " + item.getCurrentStock().stripTrailingZeros().toPlainString() +
                    " " + item.getUnit()
                );
            }

            // Calculate line amounts
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

            // Atomically deduct stock via StockService — acquires PESSIMISTIC_WRITE lock
            // and logs the movement to stock_transactions ledger.
            stockService.decreaseStock(businessId, item.getId(), qty, "SALE", invoiceNumber);

            // Build SaleItem (snapshot fields captured at sale time)
            SaleItem saleItem = SaleItem.builder()
                    .item(item)
                    .itemNameSnapshot(item.getItemName())
                    .itemCodeSnapshot(item.getItemCode())
                    .unitSnapshot(item.getUnit())
                    .quantity(qty)
                    .rate(rate)
                    .discountType(discountType)
                    .discountValue(discountValue)
                    .discountAmount(discountAmount)
                    .lineSubtotal(lineSubtotal)
                    .lineTotal(lineTotal)
                    .build();

            saleItems.add(saleItem);
        }

        // 4. Compute overall discount
        BigDecimal overallDiscountValue = request.getOverallDiscount() != null
                ? request.getOverallDiscount().setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
        BigDecimal overallDiscountAmount;
        DiscountType overallDiscountType = request.getOverallDiscountType() != null
                ? request.getOverallDiscountType() : DiscountType.AMOUNT;

        if (overallDiscountType == DiscountType.PERCENTAGE) {
            if (overallDiscountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BadRequestException("Overall discount percentage cannot exceed 100%");
            }
            overallDiscountAmount = computedSubtotal.multiply(overallDiscountValue)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            overallDiscountAmount = overallDiscountValue;
            if (overallDiscountAmount.compareTo(computedSubtotal) > 0) {
                throw new BadRequestException("Overall discount cannot exceed subtotal");
            }
        }

        BigDecimal grandTotal = computedSubtotal.subtract(overallDiscountAmount);
        BigDecimal totalDiscount = computedItemDiscount.add(overallDiscountAmount);

        // 5. Validate payment
        BigDecimal paidAmount = request.getPaidAmount().setScale(2, RoundingMode.HALF_UP);
        if (paidAmount.compareTo(grandTotal) > 0) {
            throw new BadRequestException("Paid amount cannot exceed grand total of ₹" + grandTotal.toPlainString());
        }
        if (paidAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Paid amount cannot be negative");
        }

        // 6. Determine payment status
        PaymentStatus paymentStatus;
        if (paidAmount.compareTo(grandTotal) >= 0) {
            paymentStatus = PaymentStatus.PAID;
            paidAmount = grandTotal; // cap to grand total
        } else if (paidAmount.compareTo(BigDecimal.ZERO) > 0) {
            paymentStatus = PaymentStatus.PARTIAL;
        } else {
            paymentStatus = PaymentStatus.PENDING;
        }

        BigDecimal balanceAmount = grandTotal.subtract(paidAmount);

        // 7. Invoice number already generated above (before item loop)

        // 8. Resolve creator user
        User createdBy = (principal != null)
                ? userRepository.findById(principal.getId()).orElse(null)
                : null;

        // 9. Build and save Sale
        LocalDate saleDate = request.getSaleDate() != null ? request.getSaleDate() : LocalDate.now();

        Sale sale = Sale.builder()
                .business(business)
                .invoiceNumber(invoiceNumber)
                .party(party)
                .saleDate(saleDate)
                .saleType(request.getSaleType())
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
                .status(SaleStatus.COMPLETED)
                .createdBy(createdBy)
                .build();

        Sale savedSale = saleRepository.save(sale);

        // 10. Attach and save sale items
        for (SaleItem si : saleItems) {
            si.setSale(savedSale);
        }
        saleItemRepository.saveAll(saleItems);
        savedSale.getSaleItems().addAll(saleItems);

        // 11. Post to Financial Ledger
        financialPostingService.postSale(savedSale, principal);

        // 12. Audit log
        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "SALE",
                    "SALE_CREATED",
                    savedSale.getId().toString(),
                    "Created sale " + invoiceNumber + " for " + party.getPartyName() + " — Grand Total: ₹" + grandTotal.toPlainString(),
                    clientIp
            );
        }

        log.info("Sale created: invoiceNumber={}, grandTotal={}, paymentStatus={}", invoiceNumber, grandTotal, paymentStatus);
        return toResponse(savedSale);
    }

    // =========================================================================
    // =========================================================================
    // READ OPERATIONS
    // =========================================================================

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<Sale> root, Long businessId,
                                            String search, Long partyId, String paymentStatus,
                                            SaleStatus status, LocalDate fromDate, LocalDate toDate) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("business").get("id"), businessId));

        if (search != null && !search.trim().isEmpty()) {
            String searchLower = "%" + search.trim().toLowerCase() + "%";
            Predicate invoiceMatch = cb.like(cb.lower(root.get("invoiceNumber")), searchLower);
            Predicate partyNameMatch = cb.like(cb.lower(root.get("party").get("partyName")), searchLower);
            Predicate partyMobileMatch = cb.like(cb.lower(root.get("party").get("mobile")), searchLower);
            Predicate partyCodeMatch = cb.like(cb.lower(root.get("party").get("partyCode")), searchLower);
            predicates.add(cb.or(invoiceMatch, partyNameMatch, partyMobileMatch, partyCodeMatch));
        }

        if (partyId != null) {
            predicates.add(cb.equal(root.get("party").get("id"), partyId));
        }

        if (paymentStatus != null && !paymentStatus.isEmpty() && !paymentStatus.equals("ALL")) {
            try {
                PaymentStatus ps = PaymentStatus.valueOf(paymentStatus);
                predicates.add(cb.equal(root.get("paymentStatus"), ps));
            } catch (IllegalArgumentException ignored) { /* invalid value — skip filter */ }
        }

        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        }

        if (fromDate != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("saleDate"), fromDate));
        }
        if (toDate != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("saleDate"), toDate));
        }

        return predicates;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SaleResponse> getSales(Long businessId, String search, Long partyId, String paymentStatus,
                                       SaleStatus status, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Specification<Sale> spec = (root, query, cb) -> {
            List<Predicate> predicates = buildPredicates(cb, root, businessId, search, partyId, paymentStatus, status, fromDate, toDate);
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return saleRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleById(Long id, Long businessId) {
        Sale sale = saleRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        return toResponse(sale);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleResponse getSaleByInvoiceNumber(String invoiceNumber, Long businessId) {
        Sale sale = saleRepository.findByInvoiceNumberAndBusinessId(invoiceNumber, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with invoice number: " + invoiceNumber));
        return toResponse(sale);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SaleResponse> getSalesByCustomer(Long partyId, Long businessId, Pageable pageable) {
        Specification<Sale> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("business").get("id"), businessId),
                cb.equal(root.get("party").get("id"), partyId)
        );
        return saleRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SaleSummaryDTO getSaleSummary(Long businessId, String search, Long partyId, String paymentStatus,
                                         SaleStatus status, LocalDate fromDate, LocalDate toDate) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // 1. Aggregates: Total Count, Sum Grand Total, Sum Paid Amount, Sum Balance Amount
        CriteriaQuery<Object[]> cq = cb.createQuery(Object[].class);
        Root<Sale> root = cq.from(Sale.class);
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
        BigDecimal totalRevenue = (BigDecimal) aggResult[1];
        BigDecimal totalCollected = (BigDecimal) aggResult[2];
        BigDecimal totalOutstanding = (BigDecimal) aggResult[3];

        // 2. Payment Status counts (PAID, PARTIAL, PENDING)
        CriteriaQuery<Object[]> groupCq = cb.createQuery(Object[].class);
        Root<Sale> groupRoot = groupCq.from(Sale.class);
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
        long todayCount = saleRepository.countTodayByBusinessId(businessId, today);
        BigDecimal todayRevenue = saleRepository.sumTodayRevenueByBusinessId(businessId, today);

        return SaleSummaryDTO.builder()
                .totalInvoices(totalCount)
                .paidCount(paid)
                .partialCount(partial)
                .pendingCount(pending)
                .totalRevenue(totalRevenue)
                .totalSales(totalRevenue)
                .totalCollected(totalCollected)
                .totalPaid(totalCollected)
                .totalOutstanding(totalOutstanding)
                .todayInvoices(todayCount)
                .todayRevenue(todayRevenue != null ? todayRevenue : BigDecimal.ZERO)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SaleSummaryDTO getSaleSummary(Long businessId) {
        return getSaleSummary(businessId, null, null, null, null, null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(Long id, Long businessId) {
        Sale sale = saleRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));
        // Force initialization of lazy items & party
        if (sale.getSaleItems() != null) {
            sale.getSaleItems().size();
        }
        return invoicePdfService.generateInvoicePdf(sale);
    }

    @Override
    @Transactional
    public SaleResponse cancelSale(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        Sale sale = saleRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found with id: " + id));

        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new BadRequestException("Sale " + sale.getInvoiceNumber() + " is already cancelled.");
        }

        // Revert stock for each line item via StockService — logs to ledger
        for (SaleItem saleItem : sale.getSaleItems()) {
            if (saleItem.getItem() != null && saleItem.getItem().getId() != null) {
                try {
                    stockService.increaseStock(
                            businessId,
                            saleItem.getItem().getId(),
                            saleItem.getQuantity(),
                            "SALE_CANCEL",
                            sale.getInvoiceNumber()
                    );
                    log.info("Restored stock for item ID {} by {} via SALE_CANCEL:{}",
                            saleItem.getItem().getId(), saleItem.getQuantity(), sale.getInvoiceNumber());
                } catch (Exception e) {
                    log.warn("Could not restore stock for item ID {} during sale cancel: {}",
                            saleItem.getItem().getId(), e.getMessage());
                }
            }
        }

        sale.setStatus(SaleStatus.CANCELLED);
        Sale savedSale = saleRepository.save(sale);

        // Reverse from financial ledger
        financialPostingService.reverseSale(savedSale, principal);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "SALE",
                    "SALE_CANCELLED",
                    savedSale.getId().toString(),
                    "Cancelled sale " + savedSale.getInvoiceNumber() + " and restored stock",
                    clientIp
            );
        }
        log.info("Sale {} cancelled successfully", savedSale.getInvoiceNumber());
        return toResponse(savedSale);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /** Generate concurrency-safe sequential invoice number: INV-000001 */
    private synchronized String generateUniqueInvoiceNumber() {
        Long maxId = saleRepository.getMaxId();
        long nextNum = (maxId != null ? maxId : 0) + 1;
        String invoiceNumber = String.format("INV-%06d", nextNum);

        while (saleRepository.existsByInvoiceNumber(invoiceNumber)) {
            nextNum++;
            invoiceNumber = String.format("INV-%06d", nextNum);
        }
        return invoiceNumber;
    }

    /** Map Sale entity to SaleResponse DTO with complete customer and business details. */
    private SaleResponse toResponse(Sale sale) {
        Party party = sale.getParty();
        Business biz = sale.getBusiness();
        List<SaleItemResponse> itemResponses = sale.getSaleItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        return SaleResponse.builder()
                .id(sale.getId())
                .invoiceNumber(sale.getInvoiceNumber())
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
                .saleDate(sale.getSaleDate())
                .saleType(sale.getSaleType())
                .subtotal(sale.getSubtotal())
                .itemDiscount(sale.getItemDiscount())
                .overallDiscount(sale.getOverallDiscount())
                .totalDiscount(sale.getTotalDiscount())
                .grandTotal(sale.getGrandTotal())
                .paidAmount(sale.getPaidAmount())
                .balanceAmount(sale.getBalanceAmount())
                .paymentStatus(sale.getPaymentStatus())
                .paymentMode(sale.getPaymentMode())
                .items(itemResponses)
                .notes(sale.getNotes())
                .status(sale.getStatus())
                .createdById(sale.getCreatedBy() != null ? sale.getCreatedBy().getId() : null)
                .createdByName(sale.getCreatedBy() != null ? sale.getCreatedBy().getName() : null)
                .createdAt(sale.getCreatedAt())
                .updatedAt(sale.getUpdatedAt())
                .build();
    }

    private SaleItemResponse toItemResponse(SaleItem si) {
        return SaleItemResponse.builder()
                .id(si.getId())
                .itemId(si.getItem() != null ? si.getItem().getId() : null)
                .itemNameSnapshot(si.getItemNameSnapshot())
                .itemCodeSnapshot(si.getItemCodeSnapshot())
                .unitSnapshot(si.getUnitSnapshot())
                .quantity(si.getQuantity())
                .rate(si.getRate())
                .discountType(si.getDiscountType())
                .discountValue(si.getDiscountValue())
                .discountAmount(si.getDiscountAmount())
                .lineSubtotal(si.getLineSubtotal())
                .lineTotal(si.getLineTotal())
                .createdAt(si.getCreatedAt())
                .build();
    }
}
