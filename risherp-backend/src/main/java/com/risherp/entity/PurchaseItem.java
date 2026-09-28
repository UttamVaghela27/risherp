package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PurchaseItem Entity
 * Represents one line item within a purchase invoice.
 *
 * SNAPSHOT FIELDS:
 *   item_name_snapshot, item_code_snapshot, unit_snapshot
 *   are preserved from Item at the time of purchase.
 */
@Entity
@Table(
    name = "purchase_items",
    indexes = {
        @Index(name = "idx_purchase_items_purchase_id", columnList = "purchase_id"),
        @Index(name = "idx_purchase_items_item_id",     columnList = "item_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_id", nullable = false)
    private Purchase purchase;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    // ---- Snapshot Fields ----

    @Column(name = "item_name_snapshot", nullable = false, length = 200)
    private String itemNameSnapshot;

    @Column(name = "item_code_snapshot", nullable = false, length = 50)
    private String itemCodeSnapshot;

    @Column(name = "unit_snapshot", nullable = false, length = 20)
    private String unitSnapshot;

    // ---- Transaction Values ----

    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal rate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType = DiscountType.AMOUNT;

    @Builder.Default
    @Column(name = "discount_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "discount_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "tax_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    /** lineSubtotal = quantity * rate */
    @Column(name = "line_subtotal", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineSubtotal;

    /** lineTotal = lineSubtotal - discountAmount + taxAmount */
    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
