package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * DocumentSequence Entity
 * Ensures concurrency-safe, gap-managed document number generation across
 * Sales, Purchases, Returns, Receipts, and Payments.
 */
@Entity
@Table(name = "document_sequences", uniqueConstraints = {
    @UniqueConstraint(name = "uk_doc_sequence_biz_type", columnNames = {"business_id", "document_type"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentSequence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(nullable = false, length = 20)
    private String prefix;

    @Column(name = "next_number", nullable = false)
    private Long nextNumber;

    @Column(name = "number_length", nullable = false)
    private Integer numberLength;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
