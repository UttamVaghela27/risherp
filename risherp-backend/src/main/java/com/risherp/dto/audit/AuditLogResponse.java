package com.risherp.dto.audit;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLogResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String username;
    private String module;
    private String action;
    private String recordId;
    private String entityType;
    private String entityId;
    private String referenceNumber;
    private String description;
    private String oldValue;
    private String newValue;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
}
