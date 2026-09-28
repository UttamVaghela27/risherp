package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * PurchaseReturn Entity
 *
 * Represents a return / debit note transaction against an original Purchase.
 * Every return must reference a valid, non-cancelled Purchase.
 *
 * FINANCIAL SUMMARY:
 *   subtotal                 = sum of all return line totals (after per-line discounts)
 *   itemDiscount             = total per-line discount amounts of returned items
 *   overallDiscountAllocated = proportional share of original purchase overall discount
 *   totalDiscount            = itemDiscount + overallDiscountAllocated
 *   returnAmount             = subtotal - overallDiscountAllocated (effective return value)
 *   refundAmount             = amount received back from supplier (cash/bank)
 *   adjustmentAmount         = balance reduced from supplier payable outstanding (CREDIT_ADJUSTMENT)
 *
 * INTEGRATION HOOK:
 *   refundAmount + adjustmentAmount always sum to returnAmount.
 *   Phase 14 Ledger will consume these fields.
 */
@Entity
@Table(
    name = "purchase_returns",
    indexes = {
        @Index(name = "idx_pr_return_number", columnList = "return_number", unique = true),
        @Index(name = "idx_pr_purchase_id",   columnList = "purchase_id"),
        @Index(name = "idx_pr_party_id",      columnList = "party_id"),
        @Index(name = "idx_pr_biz_date",      columnList = "business_id, return_date"),
        @Index(name = "idx_pr_biz_status",    columnList = "business_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "return_number", nullable = false, unique = true, length = 20)
    private String returnNumber;

    /** The original purchase this return is against. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "purchase_id", nullable = false)
    private Purchase purchase;

    /** Supplier (same as original purchase's party). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    // ---- Financial Summary ----

    @Builder.Default
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "item_discount", nullable = false, precision = 15, scale = 2)
    private BigDecimal itemDiscount = BigDecimal.ZERO;

    /** Proportional share of original purchase's overall discount allocated to returned items. */
    @Builder.Default
    @Column(name = "overall_discount_allocated", nullable = false, precision = 15, scale = 2)
    private BigDecimal overallDiscountAllocated = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_discount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    /** Effective return value = subtotal - overallDiscountAllocated */
    @Builder.Default
    @Column(name = "return_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal returnAmount = BigDecimal.ZERO;

    /** Amount refunded by supplier in cash / bank (Phase 14 integration hook). */
    @Builder.Default
    @Column(name = "refund_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    /** Amount applied as debit note / supplier payable reduction. */
    @Builder.Default
    @Column(name = "adjustment_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal adjustmentAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "refund_mode", nullable = false, length = 30)
    private RefundMode refundMode = RefundMode.CREDIT_ADJUSTMENT;

    // ---- Return Reason ----

    @Column(length = 500)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ---- Status ----

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PurchaseReturnStatus status = PurchaseReturnStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---- Child Items ----

    @OneToMany(mappedBy = "purchaseReturn", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PurchaseReturnItem> returnItems = new ArrayList<>();
}
