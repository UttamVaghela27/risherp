package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * AuditLog Entity
 * Stores immutable audit logs of system actions (Auth, Sales, Stock, Users,
 * etc.)
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_logs_biz_created", columnList = "business_id, created_at"),
    @Index(name = "idx_audit_logs_module", columnList = "module")
})
@Getter
@Setter
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "business_id")
    private Long businessId;

    @Column(nullable = false, length = 50)
    private String module;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "record_id", length = 100)
    private String recordId;

    @Column(length = 100)
    private String username;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id", length = 50)
    private String entityId;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public AuditLog() {
    }

    public AuditLog(Long id, Long userId, String userEmail, Long businessId, String module, String action,
            String recordId, String username, String entityType, String entityId, String referenceNumber,
            String description, String oldValue, String newValue, String ipAddress, String userAgent,
            LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.businessId = businessId;
        this.module = module;
        this.action = action;
        this.recordId = recordId;
        this.username = username;
        this.entityType = entityType;
        this.entityId = entityId;
        this.referenceNumber = referenceNumber;
        this.description = description;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.createdAt = createdAt;
    }

    public static AuditLogBuilder builder() {
        return new AuditLogBuilder();
    }

    public static class AuditLogBuilder {
        private Long id;
        private Long userId;
        private String userEmail;
        private Long businessId;
        private String module;
        private String action;
        private String recordId;
        private String username;
        private String entityType;
        private String entityId;
        private String referenceNumber;
        private String description;
        private String oldValue;
        private String newValue;
        private String ipAddress;
        private String userAgent;
        private LocalDateTime createdAt;

        AuditLogBuilder() {
        }

        public AuditLogBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AuditLogBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public AuditLogBuilder userEmail(String userEmail) {
            this.userEmail = userEmail;
            return this;
        }

        public AuditLogBuilder businessId(Long businessId) {
            this.businessId = businessId;
            return this;
        }

        public AuditLogBuilder module(String module) {
            this.module = module;
            return this;
        }

        public AuditLogBuilder action(String action) {
            this.action = action;
            return this;
        }

        public AuditLogBuilder recordId(String recordId) {
            this.recordId = recordId;
            return this;
        }

        public AuditLogBuilder username(String username) {
            this.username = username;
            return this;
        }

        public AuditLogBuilder entityType(String entityType) {
            this.entityType = entityType;
            return this;
        }

        public AuditLogBuilder entityId(String entityId) {
            this.entityId = entityId;
            return this;
        }

        public AuditLogBuilder referenceNumber(String referenceNumber) {
            this.referenceNumber = referenceNumber;
            return this;
        }

        public AuditLogBuilder description(String description) {
            this.description = description;
            return this;
        }

        public AuditLogBuilder oldValue(String oldValue) {
            this.oldValue = oldValue;
            return this;
        }

        public AuditLogBuilder newValue(String newValue) {
            this.newValue = newValue;
            return this;
        }

        public AuditLogBuilder ipAddress(String ipAddress) {
            this.ipAddress = ipAddress;
            return this;
        }

        public AuditLogBuilder userAgent(String userAgent) {
            this.userAgent = userAgent;
            return this;
        }

        public AuditLogBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AuditLog build() {
            return new AuditLog(id, userId, userEmail, businessId, module, action, recordId, username,
                    entityType, entityId, referenceNumber, description, oldValue, newValue, ipAddress, userAgent,
                    createdAt);
        }

        @Override
        public String toString() {
            return "AuditLog.AuditLogBuilder(id=" + this.id + ", userId=" + this.userId + ", userEmail="
                    + this.userEmail + ", businessId=" + this.businessId + ", module=" + this.module + ", action="
                    + this.action + ", recordId=" + this.recordId + ", username=" + this.username + ", entityType="
                    + this.entityType + ", entityId=" + this.entityId + ", referenceNumber=" + this.referenceNumber
                    + ", description=" + this.description + ", oldValue=" + this.oldValue + ", newValue="
                    + this.newValue + ", ipAddress=" + this.ipAddress + ", userAgent=" + this.userAgent
                    + ", createdAt=" + this.createdAt + ")";
        }
    }
}
