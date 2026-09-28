package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SalesReturnItem Entity
 *
 * One row per returned item within a SalesReturn.
 * References the original SaleItem as the authoritative source of truth.
 *
 * SNAPSHOT FIELDS capture item details at return time so historical
 * records remain accurate even if Item Master is changed later.
 *
 * returnQuantity must never exceed (originalQuantity - alreadyReturnedQuantity).
 * This is enforced by SalesReturnService during creation.
 */
@Entity
@Table(
    name = "sales_return_items",
    indexes = {
        @Index(name = "idx_sri_return_id",   columnList = "sales_return_id"),
        @Index(name = "idx_sri_sale_item_id", columnList = "sale_item_id"),
        @Index(name = "idx_sri_item_id",      columnList = "item_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReturnItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sales_return_id", nullable = false)
    private SalesReturn salesReturn;

    /**
     * Reference to the original SaleItem.
     * This enables calculating cumulative returned quantities across multiple returns.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_item_id", nullable = false)
    private SaleItem saleItem;

    /**
     * Soft link to current Item. Nullable — item may be deleted but
     * historical return record survives using snapshot fields.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    // ---- Snapshots (captured at return time) ----

    @Column(name = "item_name_snapshot", nullable = false, length = 200)
    private String itemNameSnapshot;

    @Column(name = "item_code_snapshot", nullable = false, length = 50)
    private String itemCodeSnapshot;

    @Column(name = "unit_snapshot", nullable = false, length = 20)
    private String unitSnapshot;

    // ---- Original Sale Reference Values ----

    /** Quantity originally sold in the original SaleItem. */
    @Column(name = "original_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal originalQuantity;

    /** Total qty already returned for this SaleItem across prior returns (snapshot at creation time). */
    @Column(name = "already_returned_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal alreadyReturnedQuantity;

    // ---- Return Values ----

    @Column(name = "return_quantity", nullable = false, precision = 15, scale = 3)
    private BigDecimal returnQuantity;

    /** Effective per-unit rate from original sale (lineTotal / originalQuantity). */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal rate;

    /** Per-line discount amount proportional to returned quantity. */
    @Builder.Default
    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    /** returnQuantity × effectiveRate (after per-line discount). */
    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
