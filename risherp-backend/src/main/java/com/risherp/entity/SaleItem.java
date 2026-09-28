package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SaleItem Entity
 * Represents one line item within a sales invoice.
 *
 * SNAPSHOT FIELDS:
 *   item_name_snapshot, item_code_snapshot, unit_snapshot
 *   are copied from Item at time of sale and stored here permanently.
 *   This ensures historical invoices remain accurate even if the Item Master is updated later.
 *
 * item_id is nullable with ON DELETE SET NULL semantics — so historical invoices survive
 * the physical deletion of an item from Item Master.
 */
@Entity
@Table(
    name = "sale_items",
    indexes = {
        @Index(name = "idx_sale_items_sale_id", columnList = "sale_id"),
        @Index(name = "idx_sale_items_item_id", columnList = "item_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    /**
     * Soft link to Item. Nullable so invoice survives item deletion.
     * Historical display uses snapshot fields, not live Item data.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    // ---- Snapshot Fields (captured at time of sale) ----

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

    /** lineSubtotal = quantity × rate */
    @Column(name = "line_subtotal", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineSubtotal;

    /** lineTotal = lineSubtotal - discountAmount */
    @Column(name = "line_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
