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
 * Purchase Entity
 * Represents a completed or cancelled purchase invoice in RISHERP.
 *
 * Relationships:
 *   Purchase → Party         (ManyToOne, Supplier)
 *   Purchase → Business      (ManyToOne)
 *   Purchase → User          (ManyToOne, created_by)
 *   Purchase → PurchaseItems (OneToMany, cascade persist/merge)
 */
@Entity
@Table(
    name = "purchases",
    indexes = {
        @Index(name = "idx_purchases_number",          columnList = "purchase_number", unique = true),
        @Index(name = "idx_purchases_biz_party",       columnList = "business_id, party_id"),
        @Index(name = "idx_purchases_biz_date",        columnList = "business_id, purchase_date"),
        @Index(name = "idx_purchases_biz_pay_status",  columnList = "business_id, payment_status"),
        @Index(name = "idx_purchases_biz_status",      columnList = "business_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "purchase_number", nullable = false, unique = true, length = 50)
    private String purchaseNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    @Column(name = "purchase_date", nullable = false)
    private LocalDate purchaseDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_type", nullable = false, length = 20)
    private PurchaseType purchaseType;

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
    private PurchaseStatus status = PurchaseStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ---- Child Items ----

    @OneToMany(mappedBy = "purchase", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PurchaseItem> purchaseItems = new ArrayList<>();
}
