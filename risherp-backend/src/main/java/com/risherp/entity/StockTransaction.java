package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * StockTransaction Entity
 *
 * Immutable audit ledger recording every stock movement (increase/decrease).
 * Created by StockServiceImpl for every call to increaseStock() or decreaseStock().
 * Once written, records are never updated or deleted — append-only audit trail.
 *
 * Table: stock_transactions
 */
@Entity
@Table(
    name = "stock_transactions",
    indexes = {
        @Index(name = "idx_stxn_item_biz", columnList = "item_id, business_id"),
        @Index(name = "idx_stxn_biz_created", columnList = "business_id, created_at"),
        @Index(name = "idx_stxn_ref_type", columnList = "reference_type, reference_number")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Business (tenant) this transaction belongs to. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    /** Item whose stock was modified. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    /** Snapshot of item name at transaction time — stays valid even if item name changes later. */
    @Column(name = "item_name_snapshot", nullable = false, length = 200)
    private String itemNameSnapshot;

    /** Snapshot of item code at transaction time. */
    @Column(name = "item_code_snapshot", nullable = false, length = 50)
    private String itemCodeSnapshot;

    /** Snapshot of unit at transaction time. */
    @Column(name = "unit_snapshot", nullable = false, length = 20)
    private String unitSnapshot;

    /**
     * Transaction type: IN (stock increase) or OUT (stock decrease).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "txn_type", nullable = false, length = 10)
    private StockTxnType txnType;

    /** Quantity moved — always positive. Direction is conveyed by txnType. */
    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;

    /** Stock balance BEFORE this transaction. */
    @Column(name = "stock_before", nullable = false, precision = 15, scale = 3)
    private BigDecimal stockBefore;

    /** Stock balance AFTER this transaction. */
    @Column(name = "stock_after", nullable = false, precision = 15, scale = 3)
    private BigDecimal stockAfter;

    /**
     * Source module that triggered this movement.
     * e.g., "SALE", "PURCHASE", "SALE_CANCEL", "PURCHASE_CANCEL", "ADJUSTMENT"
     */
    @Column(name = "reference_type", nullable = false, length = 50)
    private String referenceType;

    /**
     * Source document reference number.
     * e.g., "INV-000001", "PUR-000001"
     */
    @Column(name = "reference_number", nullable = false, length = 100)
    private String referenceNumber;

    /** Optional human-readable note or reason. */
    @Column(length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
