package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * LedgerEntry Entity
 *
 * Immutable financial audit ledger recording all financial movements
 * (Debit and Credit) for customers, suppliers, and general parties.
 *
 * Debit and Credit Rules:
 *   Customer:
 *     - OPENING_BALANCE (Receivable) → Debit
 *     - SALE                         → Debit
 *     - RECEIPT                      → Credit
 *     - SALES_RETURN                 → Credit
 *   Supplier:
 *     - OPENING_BALANCE (Payable)    → Credit
 *     - PURCHASE                     → Credit
 *     - PAYMENT                      → Debit
 *     - PURCHASE_RETURN              → Debit
 *
 * Duplicate Protection:
 *   Unique constraint on (business_id, party_id, reference_type, reference_id, transaction_type)
 *   ensures a source transaction cannot be double-posted.
 *
 * Table: ledger_entries
 */
@Entity
@Table(
    name = "ledger_entries",
    indexes = {
        @Index(name = "idx_ledger_party_biz", columnList = "party_id, business_id"),
        @Index(name = "idx_ledger_biz_date", columnList = "business_id, transaction_date"),
        @Index(name = "idx_ledger_txn_type", columnList = "business_id, transaction_type"),
        @Index(name = "idx_ledger_ref_type_id", columnList = "reference_type, reference_id")
    },
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_ledger_entry_ref",
            columnNames = {"business_id", "party_id", "reference_type", "reference_id", "transaction_type"}
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "party_id", nullable = false)
    private Party party;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 30)
    private LedgerTransactionType transactionType;

    /**
     * Source document type: e.g., "OPENING_BALANCE", "SALE", "RECEIPT", "SALES_RETURN", "PURCHASE", "PAYMENT", "PURCHASE_RETURN"
     */
    @Column(name = "reference_type", nullable = false, length = 50)
    private String referenceType;

    /**
     * Source document primary key ID.
     */
    @Column(name = "reference_id", nullable = false)
    private Long referenceId;

    /**
     * Source document human-readable number: e.g., "OPENING", "INV-000001", "REC-000001", "PUR-000001", "PAY-000001"
     */
    @Column(name = "reference_number", nullable = false, length = 100)
    private String referenceNumber;

    @Builder.Default
    @Column(name = "debit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal debitAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "credit_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal creditAmount = BigDecimal.ZERO;

    @Column(length = 500)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
