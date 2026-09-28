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
 * SalesReturn Entity
 *
 * Represents a credit/return transaction against an original Sale invoice.
 * Every return must reference a valid, non-cancelled Sale.
 *
 * FINANCIAL SUMMARY:
 *   subtotal                = sum of all return line totals (after per-line discounts)
 *   itemDiscount            = total per-line discount amounts of returned items
 *   overallDiscountAllocated= proportional share of original invoice overall discount
 *   totalDiscount           = itemDiscount + overallDiscountAllocated
 *   returnAmount            = subtotal - overallDiscountAllocated (effective refund value)
 *   refundAmount            = amount actually paid back (cash/bank/credit)
 *   adjustmentAmount        = balance reduced from customer outstanding (for CREDIT_ADJUSTMENT)
 *
 * INTEGRATION HOOK:
 *   refundAmount + adjustmentAmount always sum to returnAmount.
 *   Phase 14 Ledger will consume these fields.
 */
@Entity
@Table(
    name = "sales_returns",
    indexes = {
        @Index(name = "idx_sr_return_number", columnList = "return_number", unique = true),
        @Index(name = "idx_sr_sale_id",       columnList = "sale_id"),
        @Index(name = "idx_sr_party_id",      columnList = "party_id"),
        @Index(name = "idx_sr_biz_date",      columnList = "business_id, return_date"),
        @Index(name = "idx_sr_biz_status",    columnList = "business_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "return_number", nullable = false, unique = true, length = 20)
    private String returnNumber;

    /** The original sale this return is against. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    /** Customer (same as original sale's party). */
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

    /** Proportional share of original invoice's overall discount allocated to returned items. */
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

    /** Amount refunded in cash / bank (Phase 14 integration hook). */
    @Builder.Default
    @Column(name = "refund_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    /** Amount applied as credit note / outstanding reduction. */
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
    private SalesReturnStatus status = SalesReturnStatus.COMPLETED;

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

    @OneToMany(mappedBy = "salesReturn", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SalesReturnItem> returnItems = new ArrayList<>();
}
