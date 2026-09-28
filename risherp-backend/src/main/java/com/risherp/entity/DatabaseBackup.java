package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * DatabaseBackup Entity
 * Stores metadata and execution status of enterprise database backups.
 * Actual SQL dumps reside in secure non-public filesystem storage.
 */
@Entity
@Table(name = "database_backups", indexes = {
    @Index(name = "idx_db_backups_biz_created", columnList = "business_id, created_at"),
    @Index(name = "idx_db_backups_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatabaseBackup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_id", nullable = false)
    private Long businessId;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize; // in bytes

    @Column(name = "backup_type", nullable = false, length = 50)
    private String backupType; // MANUAL, PRE_RESTORE_SAFETY

    @Column(nullable = false, length = 30)
    private String status; // PENDING, IN_PROGRESS, COMPLETED, FAILED, RESTORED

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_by_name", length = 100)
    private String createdByName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
