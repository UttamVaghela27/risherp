package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Party Entity
 * Represents customers, suppliers, or both parties for a business in RISHERP.
 * Fully prepared for future Sales, Purchase, Receipts, Payments, and Ledger modules.
 */
@Entity
@Table(
    name = "parties",
    indexes = {
        @Index(name = "idx_parties_code", columnList = "party_code", unique = true),
        @Index(name = "idx_parties_biz_type", columnList = "business_id, party_type"),
        @Index(name = "idx_parties_biz_status", columnList = "business_id, status"),
        @Index(name = "idx_parties_biz_name", columnList = "business_id, party_name"),
        @Index(name = "idx_parties_biz_mobile", columnList = "business_id, mobile")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Party {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "party_code", nullable = false, unique = true, length = 50)
    private String partyCode;

    @Column(name = "party_name", nullable = false, length = 150)
    private String partyName;

    @Enumerated(EnumType.STRING)
    @Column(name = "party_type", nullable = false, length = 20)
    private PartyType partyType;

    @Column(name = "contact_person", length = 100)
    private String contactPerson;

    @Column(nullable = false, length = 20)
    private String mobile;

    @Column(name = "alternate_mobile", length = 20)
    private String alternateMobile;

    @Column(length = 150)
    private String email;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 20)
    private String pincode;

    @Builder.Default
    @Column(name = "opening_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal openingBalance = BigDecimal.ZERO;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "opening_balance_type", nullable = false, length = 20)
    private OpeningBalanceType openingBalanceType = OpeningBalanceType.NONE;

    @Builder.Default
    @Column(name = "credit_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PartyStatus status = PartyStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
