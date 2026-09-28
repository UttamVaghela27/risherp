package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Item Entity
 * Represents products and goods maintained, purchased, and sold in RISHERP.
 * Fully prepared for future Sales, Purchase, and Stock Transaction modules.
 */
@Entity
@Table(
    name = "items",
    indexes = {
        @Index(name = "idx_items_biz_code", columnList = "business_id, item_code"),
        @Index(name = "idx_items_biz_barcode", columnList = "business_id, barcode"),
        @Index(name = "idx_items_biz_name", columnList = "business_id, item_name"),
        @Index(name = "idx_items_biz_cat", columnList = "business_id, category_id"),
        @Index(name = "idx_items_biz_status", columnList = "business_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "item_code", nullable = false, length = 50)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(nullable = false, length = 20)
    private String unit;

    @Builder.Default
    @Column(name = "purchase_rate", nullable = false, precision = 15, scale = 2)
    private BigDecimal purchaseRate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "sale_rate", nullable = false, precision = 15, scale = 2)
    private BigDecimal saleRate = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "current_stock", nullable = false, precision = 15, scale = 2)
    private BigDecimal currentStock = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "minimum_stock", nullable = false, precision = 15, scale = 2)
    private BigDecimal minimumStock = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemStatus status = ItemStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Compute current stock status dynamically without persisting in the database.
     */
    @Transient
    public StockStatus getStockStatus() {
        return StockStatus.calculate(this.currentStock, this.minimumStock);
    }

    /**
     * Calculate basic stock valuation: currentStock * purchaseRate.
     */
    @Transient
    public BigDecimal getStockValue() {
        if (this.currentStock == null || this.purchaseRate == null) {
            return BigDecimal.ZERO;
        }
        return this.currentStock.multiply(this.purchaseRate);
    }
}
