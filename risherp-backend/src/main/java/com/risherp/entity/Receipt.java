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
 * Receipt Entity
 *
 * Represents an incoming payment collected from a customer.
 * Can be allocated across multiple sales invoices or held as unallocated advance.
 */
@Entity
@Table(
    name = "receipts",
    indexes = {
        @Index(name = "idx_receipt_number",     columnList = "receipt_number", unique = true),
        @Index(name = "idx_receipt_party_id",   columnList = "party_id"),
        @Index(name = "idx_receipt_biz_date",   columnList = "business_id, receipt_date"),
        @Index(name = "idx_receipt_biz_status", columnList = "business_id, status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_number", nullable = false, unique = true, length = 30)
    private String receiptNumber;

    /** Customer (Party). */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "receipt_date", nullable = false)
    private LocalDate receiptDate;

    /** Total amount collected in this receipt transaction. */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_mode", nullable = false, length = 30)
    private PaymentMode paymentMode;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    /** Total amount allocated to specific sales invoices. */
    @Builder.Default
    @Column(name = "allocated_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal allocatedAmount = BigDecimal.ZERO;

    /** Unallocated remainder = amount - allocatedAmount (customer advance). */
    @Builder.Default
    @Column(name = "unallocated_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal unallocatedAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReceiptStatus status = ReceiptStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "receipt", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReceiptAllocation> allocations = new ArrayList<>();
}
