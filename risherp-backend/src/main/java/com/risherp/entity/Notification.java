package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Notification Entity
 * Stores system and transaction notifications per business tenant.
 */
@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_biz_read", columnList = "business_id, is_read"),
        @Index(name = "idx_notifications_biz_created", columnList = "business_id, created_at")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "business_id", nullable = false)
    private Business business;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 30)
    @Builder.Default
    private String type = "INFO"; // INFO, WARNING, SUCCESS, ERROR

    @Column(length = 255)
    private String link;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
