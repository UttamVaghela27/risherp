package com.risherp.service.impl;

import com.risherp.dto.salesreturn.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.SalesReturnPdfService;
import com.risherp.service.SalesReturnService;
import com.risherp.service.StockService;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
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
 * SalesReturnServiceImpl — Phase 12 implementation.
 *
 * KEY DESIGN:
 *   1. All validation is server-side.
 *   2. Return amounts are always recalculated from original SaleItem data.
 *   3. Stock is only increased via StockService (never directly).
 *   4. The whole operation is a single @Transactional — any failure rolls back.
 *   5. Concurrency: returnable-qty aggregate query + new item write happen in same transaction.
 *
 * RETURN AMOUNT CALCULATION:
 *   - Per-unit effective amount = lineTotal / originalQuantity
 *   - Return line total = returnQty × perUnitAmount
 *   - Per-line discount = proportional (returnQty / originalQty × discountAmount)
 *   - Overall-discount allocation = returnLineTotal × (overallDiscount / subtotal)
 *   - finalReturnAmount = sum(returnLineTotals) - overallDiscountAllocated
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SalesReturnServiceImpl implements SalesReturnService {

    private final SalesReturnRepository salesReturnRepository;
    private final SalesReturnItemRepository salesReturnItemRepository;
    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;
    private final StockService stockService;
    private final AuditLogService auditLogService;
    private final SalesReturnPdfService salesReturnPdfService;
    private final com.risherp.service.FinancialPostingService financialPostingService;
    private final com.risherp.service.DocumentSequenceService documentSequenceService;

    // =========================================================================
    // CREATE
    // =========================================================================

    @Override
    @Transactional
    public SalesReturnResponse createSalesReturn(CreateSalesReturnRequest request,
                                                  Long businessId,
                                                  UserPrincipal principal,
                                                  String clientIp) {
        log.info("Creating sales return for saleId={}, businessId={}", request.getSaleId(), businessId);

        // 1. Load business
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found"));

        // 2. Load and validate original sale
        Sale sale = saleRepository.findByIdAndBusinessId(request.getSaleId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found: ID " + request.getSaleId()));

        if (sale.getStatus() == SaleStatus.CANCELLED) {
            throw new BadRequestException("Sales return cannot be created for a cancelled sale: " + sale.getInvoiceNumber());
        }

        if (sale.getSaleItems() == null || sale.getSaleItems().isEmpty()) {
            throw new BadRequestException("Original sale has no items.");
        }

        // 3. Validate return date
        LocalDate returnDate = request.getReturnDate() != null ? request.getReturnDate() : LocalDate.now();
        if (returnDate.isAfter(LocalDate.now())) {
            throw new BadRequestException("Return date cannot be in the future.");
        }

        // 4. Validate request items (non-empty guaranteed by @Size but double-check)
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("At least one return item is required.");
        }

        // 5. Generate return number early using concurrency-safe document sequence mechanism
        String returnNumber = documentSequenceService.generateNextNumber(businessId, "SALES_RETURN");

        // 6. Process each return item
        List<SalesReturnItem> returnItems = new ArrayList<>();
        BigDecimal computedSubtotal = BigDecimal.ZERO;
        BigDecimal computedItemDiscount = BigDecimal.ZERO;

        for (SalesReturnItemRequest itemReq : request.getItems()) {
            // Load original SaleItem
            SaleItem originalItem = saleItemRepository.findByIdAndSaleId(itemReq.getSaleItemId(), sale.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Sale item not found: ID " + itemReq.getSaleItemId() + " in sale " + sale.getInvoiceNumber()));

            BigDecimal returnQty = itemReq.getReturnQuantity().setScale(3, RoundingMode.HALF_UP);

            if (returnQty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Return quantity must be greater than zero for item: " + originalItem.getItemNameSnapshot());
            }

            // Concurrency-safe: query sum inside same @Transactional
            BigDecimal alreadyReturned = salesReturnItemRepository.sumReturnedQuantityBySaleItemId(originalItem.getId());
            BigDecimal returnableQty = originalItem.getQuantity().subtract(alreadyReturned).setScale(3, RoundingMode.HALF_UP);

            if (returnableQty.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("No returnable quantity remaining for item: " + originalItem.getItemNameSnapshot());
            }

            if (returnQty.compareTo(returnableQty) > 0) {
                throw new BadRequestException(
                        "Return quantity " + returnQty.stripTrailingZeros().toPlainString() +
                        " exceeds returnable quantity " + returnableQty.stripTrailingZeros().toPlainString() +
                        " for item: " + originalItem.getItemNameSnapshot()
                );
            }

            // Calculate return financials using original SaleItem data
            BigDecimal origQty = originalItem.getQuantity();
            BigDecimal origLineTotal = originalItem.getLineTotal();       // after per-item discount
            BigDecimal origDiscountAmount = originalItem.getDiscountAmount();

            // Proportion of original qty being returned
            BigDecimal proportion = returnQty.divide(origQty, 10, RoundingMode.HALF_UP);

            // Return line total = proportional share of original lineTotal
            BigDecimal returnLineTotal = origLineTotal.multiply(proportion).setScale(2, RoundingMode.HALF_UP);

            // Per-line discount = proportional share of original discount
            BigDecimal returnDiscountAmount = origDiscountAmount.multiply(proportion).setScale(2, RoundingMode.HALF_UP);

            // Effective rate per unit (from original sale)
            BigDecimal effectiveRate = origLineTotal.divide(origQty, 2, RoundingMode.HALF_UP);

            computedSubtotal = computedSubtotal.add(returnLineTotal);
            computedItemDiscount = computedItemDiscount.add(returnDiscountAmount);

            // Build return item
            SalesReturnItem returnItem = SalesReturnItem.builder()
                    .saleItem(originalItem)
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

            // Increase stock via StockService (PESSIMISTIC_WRITE lock, logs ledger row)
            if (originalItem.getItem() != null && originalItem.getItem().getId() != null) {
                stockService.increaseStock(
                        businessId,
                        originalItem.getItem().getId(),
                        returnQty,
                        "SALES_RETURN",
                        returnNumber
                );
            }
        }

        // 7. Allocate proportional share of original invoice overall discount
        BigDecimal overallDiscountAllocated = BigDecimal.ZERO;
        if (sale.getOverallDiscount().compareTo(BigDecimal.ZERO) > 0 && sale.getSubtotal().compareTo(BigDecimal.ZERO) > 0) {
            // Weight = returnSubtotal / originalSubtotal
            BigDecimal weight = computedSubtotal.divide(sale.getSubtotal(), 10, RoundingMode.HALF_UP);
            overallDiscountAllocated = sale.getOverallDiscount().multiply(weight).setScale(2, RoundingMode.HALF_UP);
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
            // CASH or BANK — full refund, no adjustment
            refundAmount = returnAmount;
            adjustmentAmount = BigDecimal.ZERO;
        }

        // 9. Resolve creator
        User createdBy = (principal != null)
                ? userRepository.findById(principal.getId()).orElse(null)
                : null;

        // 10. Build and save SalesReturn
        SalesReturn salesReturn = SalesReturn.builder()
                .returnNumber(returnNumber)
                .sale(sale)
                .party(sale.getParty())
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
                .status(SalesReturnStatus.COMPLETED)
                .createdBy(createdBy)
                .build();

        SalesReturn saved = salesReturnRepository.save(salesReturn);

        // 11. Link and save return items
        for (SalesReturnItem ri : returnItems) {
            ri.setSalesReturn(saved);
        }
        salesReturnItemRepository.saveAll(returnItems);
        saved.getReturnItems().addAll(returnItems);

        // 10. Post to Financial Ledger
        financialPostingService.postSalesReturn(saved, principal);

        // 11. Audit log
        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "SALES_RETURN", "SALES_RETURN_CREATED",
                    saved.getId().toString(),
                    "Sales Return " + returnNumber + " created against " + sale.getInvoiceNumber() +
                    " — Return Amount: ₹" + returnAmount.toPlainString(),
                    clientIp
            );
        }

        log.info("Sales return created: returnNumber={}, returnAmount={}", returnNumber, returnAmount);
        return toResponse(saved);
    }

    // =========================================================================
    // READ
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<SalesReturnResponse> getSalesReturns(Long businessId, String search, Long partyId,
                                                      String status, LocalDate fromDate, LocalDate toDate,
                                                      Pageable pageable) {
        Specification<SalesReturn> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (search != null && !search.trim().isEmpty()) {
                String like = "%" + search.trim().toLowerCase() + "%";
                Predicate numMatch    = cb.like(cb.lower(root.get("returnNumber")), like);
                Predicate invMatch    = cb.like(cb.lower(root.get("sale").get("invoiceNumber")), like);
                Predicate partyMatch  = cb.like(cb.lower(root.get("party").get("partyName")), like);
                Predicate codeMatch   = cb.like(cb.lower(root.get("party").get("partyCode")), like);
                predicates.add(cb.or(numMatch, invMatch, partyMatch, codeMatch));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (status != null && !status.isEmpty() && !status.equals("ALL")) {
                try {
                    predicates.add(cb.equal(root.get("status"), SalesReturnStatus.valueOf(status)));
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

        Page<SalesReturn> page = salesReturnRepository.findAll(spec, pageable);
        return page.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesReturnResponse getSalesReturnById(Long id, Long businessId) {
        SalesReturn sr = salesReturnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales return not found: ID " + id));
        return toResponse(sr);
    }

    @Override
    @Transactional(readOnly = true)
    public SalesReturnResponse getSalesReturnByNumber(String returnNumber, Long businessId) {
        SalesReturn sr = salesReturnRepository.findByReturnNumberAndBusinessId(returnNumber, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales return not found: " + returnNumber));
        return toResponse(sr);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesReturnResponse> getSalesReturnsBySale(Long saleId, Long businessId) {
        return salesReturnRepository.findBySaleIdAndBusinessId(saleId, businessId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReturnableSaleItemResponse> getReturnableItems(Long saleId, Long businessId) {
        Sale sale = saleRepository.findByIdAndBusinessId(saleId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found: ID " + saleId));

        return sale.getSaleItems().stream().map(si -> {
            BigDecimal alreadyReturned = salesReturnItemRepository.sumReturnedQuantityBySaleItemId(si.getId());
            BigDecimal returnableQty = si.getQuantity().subtract(alreadyReturned).max(BigDecimal.ZERO);
            return ReturnableSaleItemResponse.builder()
                    .saleItemId(si.getId())
                    .itemId(si.getItem() != null ? si.getItem().getId() : null)
                    .itemNameSnapshot(si.getItemNameSnapshot())
                    .itemCodeSnapshot(si.getItemCodeSnapshot())
                    .unitSnapshot(si.getUnitSnapshot())
                    .originalQuantity(si.getQuantity())
                    .rate(si.getRate())
                    .discountAmount(si.getDiscountAmount())
                    .lineTotal(si.getLineTotal())
                    .alreadyReturnedQuantity(alreadyReturned)
                    .returnableQuantity(returnableQty)
                    .fullyReturned(returnableQty.compareTo(BigDecimal.ZERO) <= 0)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SalesReturnSummaryDTO getSalesReturnSummary(Long businessId) {
        long total = salesReturnRepository.countByBusinessId(businessId);
        long completed = salesReturnRepository.countByBusinessIdAndStatus(businessId, SalesReturnStatus.COMPLETED);
        long cancelled = salesReturnRepository.countByBusinessIdAndStatus(businessId, SalesReturnStatus.CANCELLED);
        long today = salesReturnRepository.countTodayByBusinessId(businessId, LocalDate.now());

        BigDecimal totalReturnAmt = salesReturnRepository.sumReturnAmountByBusinessId(businessId);
        BigDecimal totalRefund = salesReturnRepository.sumRefundAmountByBusinessId(businessId);
        BigDecimal totalAdj = salesReturnRepository.sumAdjustmentAmountByBusinessId(businessId);

        return SalesReturnSummaryDTO.builder()
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
    public SalesReturnResponse cancelSalesReturn(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        SalesReturn sr = salesReturnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales return not found: ID " + id));

        if (sr.getStatus() == SalesReturnStatus.CANCELLED) {
            throw new BadRequestException("Sales return " + sr.getReturnNumber() + " is already cancelled.");
        }

        // Reverse stock increases for each return item
        List<SalesReturnItem> items = salesReturnItemRepository.findBySalesReturnId(sr.getId());
        for (SalesReturnItem ri : items) {
            if (ri.getItem() != null && ri.getItem().getId() != null) {
                log.info("Reversing return stock for item: {} by {}", ri.getItemNameSnapshot(), ri.getReturnQuantity());
                stockService.decreaseStock(
                        businessId,
                        ri.getItem().getId(),
                        ri.getReturnQuantity(),
                        "SALES_RETURN_CANCEL",
                        sr.getReturnNumber()
                );
            }
        }

        sr.setStatus(SalesReturnStatus.CANCELLED);
        SalesReturn saved = salesReturnRepository.save(sr);

        // Reverse from financial ledger
        financialPostingService.reverseSalesReturn(saved, principal);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(), principal.getEmail(), businessId,
                    "SALES_RETURN", "SALES_RETURN_CANCELLED",
                    saved.getId().toString(),
                    "Cancelled sales return " + saved.getReturnNumber() + " — stock reversed",
                    clientIp
            );
        }

        log.info("Sales return {} cancelled", saved.getReturnNumber());
        return toResponse(saved);
    }

    // =========================================================================
    // PDF
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public byte[] generateSalesReturnPdf(Long id, Long businessId) {
        SalesReturn sr = salesReturnRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Sales return not found: ID " + id));
        if (sr.getReturnItems() != null) sr.getReturnItems().size(); // force lazy init
        return salesReturnPdfService.generateSalesReturnPdf(sr);
    }

    // =========================================================================
    // HELPER — Return Number Generation
    // =========================================================================

    private synchronized String generateUniqueReturnNumber() {
        Long maxId = salesReturnRepository.getMaxId();
        long nextSeq = (maxId != null ? maxId : 0L) + 1;
        String candidate;
        int attempts = 0;
        do {
            candidate = String.format("SR-%06d", nextSeq++);
            attempts++;
            if (attempts > 100) throw new IllegalStateException("Could not generate unique return number");
        } while (salesReturnRepository.existsByReturnNumber(candidate));
        return candidate;
    }

    // =========================================================================
    // MAPPER
    // =========================================================================

    private SalesReturnResponse toResponse(SalesReturn sr) {
        Sale sale = sr.getSale();
        Party party = sr.getParty();
        Business biz = sr.getBusiness();

        List<SalesReturnItemResponse> itemResponses = new ArrayList<>();
        if (sr.getReturnItems() != null) {
            for (SalesReturnItem ri : sr.getReturnItems()) {
                itemResponses.add(SalesReturnItemResponse.builder()
                        .id(ri.getId())
                        .saleItemId(ri.getSaleItem() != null ? ri.getSaleItem().getId() : null)
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

        return SalesReturnResponse.builder()
                .id(sr.getId())
                .returnNumber(sr.getReturnNumber())
                // Sale reference
                .saleId(sale != null ? sale.getId() : null)
                .invoiceNumber(sale != null ? sale.getInvoiceNumber() : null)
                .saleDate(sale != null ? sale.getSaleDate() : null)
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
                // Return info
                .returnDate(sr.getReturnDate())
                // Financial
                .subtotal(sr.getSubtotal())
                .itemDiscount(sr.getItemDiscount())
                .overallDiscountAllocated(sr.getOverallDiscountAllocated())
                .totalDiscount(sr.getTotalDiscount())
                .returnAmount(sr.getReturnAmount())
                .refundAmount(sr.getRefundAmount())
                .adjustmentAmount(sr.getAdjustmentAmount())
                .refundMode(sr.getRefundMode())
                // Items
                .items(itemResponses)
                // Meta
                .reason(sr.getReason())
                .notes(sr.getNotes())
                .status(sr.getStatus())
                .createdById(sr.getCreatedBy() != null ? sr.getCreatedBy().getId() : null)
                .createdByName(sr.getCreatedBy() != null ? sr.getCreatedBy().getName() : null)
                .createdAt(sr.getCreatedAt())
                .updatedAt(sr.getUpdatedAt())
                .build();
    }
}
