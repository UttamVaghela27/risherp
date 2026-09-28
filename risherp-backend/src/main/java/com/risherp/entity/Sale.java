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
 * Sale Entity
 * Represents a completed or cancelled sales invoice in RISHERP.
 *
 * Relationships:
 *   Sale → Party   (ManyToOne)
 *   Sale → User    (ManyToOne, created_by)
 *   Sale → SaleItems (OneToMany, cascade persist/merge, orphanRemoval=false for audit safety)
 *
 * Monetary fields:
 *   subtotal        = sum of all line totals (after line-level discounts)
 *   itemDiscount    = total of all line discount amounts
 *   overallDiscount = invoice-level flat discount applied on subtotal
 *   totalDiscount   = itemDiscount + overallDiscount
 *   grandTotal      = subtotal - overallDiscount
 *   paidAmount      = cash/UPI/bank collected at time of sale
 *   balanceAmount   = grandTotal - paidAmount
 *
 * Concurrency:
 *   Stock deduction uses PESSIMISTIC_WRITE lock on Item during @Transactional createSale().
 *   This prevents two concurrent sales from over-selling the same item.
 */
@Entity
@Table(
    name = "sales",
    indexes = {
        @Index(name = "idx_sales_invoice_number", columnList = "invoice_number", unique = true),
        @Index(name = "idx_sales_biz_party",      columnList = "business_id, party_id"),
        @Index(name = "idx_sales_biz_date",        columnList = "business_id, sale_date"),
        @Index(name = "idx_sales_biz_pay_status",  columnList = "business_id, payment_status"),
        @Index(name = "idx_sales_biz_status",      columnList = "business_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "invoice_number", nullable = false, unique = true, length = 30)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "sale_type", nullable = false, length = 20)
    private SaleType saleType;

    // ---- Financial Summary ----

    @Builder.Default
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "item_discount", nullable = false, precision = 15, scale = 2)
    private BigDecimal itemDiscount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "overall_discount", nullable = false, precision = 15, scale = 2)
    private BigDecimal overallDiscount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_discount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "grand_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "balance_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    // ---- Payment ----

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", length = 30)
    private PaymentMode paymentMode;

    // ---- Meta ----

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SaleStatus status = SaleStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---- Child Relationship ----

    /**
     * Sale items — cascade PERSIST and MERGE only.
     * orphanRemoval=false: removing from list should NOT delete historical sale item records.
     * Use SaleItem directly for cancellation/return scenarios in future phases.
     */
    @OneToMany(mappedBy = "sale", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SaleItem> saleItems = new ArrayList<>();
}
