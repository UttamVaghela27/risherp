package com.risherp.service;

import com.risherp.dto.audit.AuditLogResponse;
import com.risherp.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface AuditLogService {

    /**
     * Backward-compatible log method used across Phase 1-17 services.
     */
    void log(Long userId, String userEmail, Long businessId, String module, String action, String recordId, String description, String ipAddress);

    /**
     * Extended enterprise audit record method capturing entity metadata, diffs, and user agent.
     */
    void record(Long userId, String username, String userEmail, Long businessId,
                String module, String action, String entityType, String entityId,
                String referenceNumber, String description, String oldValue, String newValue,
                String ipAddress, String userAgent);

    /**
     * Legacy page retrieval.
     */
    Page<AuditLog> getLogs(Long businessId, Pageable pageable);

    /**
     * Multi-criteria server-side paginated search and filter for Audit UI.
     */
    Page<AuditLogResponse> getLogs(Long businessId, String search, String module,
                                  String action, String entityType, Long userId,
                                  LocalDate dateFrom, LocalDate dateTo, Pageable pageable);

    /**
     * Retrieve single audit log detail by ID for the given business.
     */
    AuditLogResponse getLogById(Long businessId, Long id);
}
