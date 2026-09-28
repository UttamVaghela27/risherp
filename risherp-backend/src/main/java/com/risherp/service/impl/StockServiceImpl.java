package com.risherp.service.impl;

import com.risherp.dto.stock.StockTransactionResponse;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.ItemRepository;
import com.risherp.repository.StockTransactionRepository;
import com.risherp.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final ItemRepository itemRepository;
    private final StockTransactionRepository stockTransactionRepository;

    // =========================================================================
    // STOCK INCREASE  (IN)
    // =========================================================================

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public Item increaseStock(Long businessId, Long itemId, BigDecimal quantity,
                              String referenceType, String referenceNumber) {

        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Quantity to increase must be greater than zero.");
        }

        Item item = itemRepository.findByIdAndBusinessIdWithLock(itemId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        if (item.getStatus() != ItemStatus.ACTIVE) {
            throw new BadRequestException("Cannot update stock for inactive item '" + item.getItemName() + "'");
        }

        BigDecimal prevStock = item.getCurrentStock() != null ? item.getCurrentStock() : BigDecimal.ZERO;
        BigDecimal qty       = quantity.setScale(3, RoundingMode.HALF_UP);
        BigDecimal newStock  = prevStock.add(qty);

        item.setCurrentStock(newStock);
        Item saved = itemRepository.save(item);

        // ---- Ledger entry ----
        recordTransaction(item, StockTxnType.IN, qty, prevStock, newStock, referenceType, referenceNumber, null);

        log.info("[STOCK-IN] '{}' (ID {}) {} → {} {} via [{}:{}]",
                item.getItemName(), item.getId(), prevStock, newStock, item.getUnit(), referenceType, referenceNumber);
        return saved;
    }

    // =========================================================================
    // STOCK DECREASE  (OUT)
    // =========================================================================

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public Item decreaseStock(Long businessId, Long itemId, BigDecimal quantity,
                              String referenceType, String referenceNumber) {

        if (quantity == null || quantity.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Quantity to decrease must be greater than zero.");
        }

        Item item = itemRepository.findByIdAndBusinessIdWithLock(itemId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + itemId));

        if (item.getStatus() != ItemStatus.ACTIVE) {
            throw new BadRequestException("Cannot update stock for inactive item '" + item.getItemName() + "'");
        }

        BigDecimal prevStock   = item.getCurrentStock() != null ? item.getCurrentStock() : BigDecimal.ZERO;
        BigDecimal requestedQty = quantity.setScale(3, RoundingMode.HALF_UP);

        if (prevStock.compareTo(requestedQty) < 0) {
            throw new BadRequestException(String.format(
                    "Insufficient stock for '%s'. Available: %s %s, Requested: %s %s",
                    item.getItemName(),
                    prevStock.stripTrailingZeros().toPlainString(), item.getUnit(),
                    requestedQty.stripTrailingZeros().toPlainString(), item.getUnit()
            ));
        }

        BigDecimal newStock = prevStock.subtract(requestedQty);
        item.setCurrentStock(newStock);
        Item saved = itemRepository.save(item);

        // ---- Ledger entry ----
        recordTransaction(item, StockTxnType.OUT, requestedQty, prevStock, newStock, referenceType, referenceNumber, null);

        log.info("[STOCK-OUT] '{}' (ID {}) {} → {} {} via [{}:{}]",
                item.getItemName(), item.getId(), prevStock, newStock, item.getUnit(), referenceType, referenceNumber);
        return saved;
    }

    // =========================================================================
    // STOCK LEDGER QUERY
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<StockTransactionResponse> getStockLedger(
            Long businessId,
            Long itemId,
            LocalDate fromDate,
            LocalDate toDate,
            String referenceType,
            int page,
            int size) {

        LocalDateTime fromDt = (fromDate != null) ? fromDate.atStartOfDay() : null;
        LocalDateTime toDt   = (toDate   != null) ? toDate.atTime(LocalTime.MAX) : null;
        String refType       = (referenceType != null && referenceType.isBlank()) ? null : referenceType;

        Page<StockTransaction> txnPage = stockTransactionRepository.findFiltered(
                businessId, itemId, fromDt, toDt, refType,
                PageRequest.of(page, size)
        );

        return txnPage.map(this::toResponse);
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    /** Persist one StockTransaction ledger row — called within the caller's transaction. */
    private void recordTransaction(Item item, StockTxnType type, BigDecimal qty,
                                   BigDecimal before, BigDecimal after,
                                   String referenceType, String referenceNumber, String notes) {
        StockTransaction txn = StockTransaction.builder()
                .business(item.getBusiness())
                .item(item)
                .itemNameSnapshot(item.getItemName())
                .itemCodeSnapshot(item.getItemCode())
                .unitSnapshot(item.getUnit())
                .txnType(type)
                .quantity(qty)
                .stockBefore(before.setScale(3, RoundingMode.HALF_UP))
                .stockAfter(after.setScale(3, RoundingMode.HALF_UP))
                .referenceType(referenceType)
                .referenceNumber(referenceNumber)
                .notes(notes)
                .build();
        stockTransactionRepository.save(txn);
    }

    /** Map entity → response DTO. */
    private StockTransactionResponse toResponse(StockTransaction txn) {
        return StockTransactionResponse.builder()
                .id(txn.getId())
                .itemId(txn.getItem() != null ? txn.getItem().getId() : null)
                .itemName(txn.getItemNameSnapshot())
                .itemCode(txn.getItemCodeSnapshot())
                .unit(txn.getUnitSnapshot())
                .txnType(txn.getTxnType())
                .quantity(txn.getQuantity())
                .stockBefore(txn.getStockBefore())
                .stockAfter(txn.getStockAfter())
                .referenceType(txn.getReferenceType())
                .referenceNumber(txn.getReferenceNumber())
                .notes(txn.getNotes())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
