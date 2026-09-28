package com.risherp.service.impl;

import com.risherp.dto.audit.AuditLogResponse;
import com.risherp.entity.AuditLog;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.AuditLogRepository;
import com.risherp.service.AuditLogService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Long userId, String userEmail, Long businessId, String module, String action, String recordId, String description, String ipAddress) {
        record(userId, null, userEmail, businessId, module, action, null, recordId, null, description, null, null, ipAddress, null);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(Long userId, String username, String userEmail, Long businessId,
                       String module, String action, String entityType, String entityId,
                       String referenceNumber, String description, String oldValue, String newValue,
                       String ipAddress, String userAgent) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .userId(userId)
                    .username(username)
                    .userEmail(userEmail)
                    .businessId(businessId)
                    .module(module != null ? module.toUpperCase() : "GENERAL")
                    .action(action != null ? action.toUpperCase() : "ACTION")
                    .entityType(entityType)
                    .entityId(entityId)
                    .referenceNumber(referenceNumber)
                    .recordId(entityId != null ? entityId : referenceNumber)
                    .description(sanitize(description))
                    .oldValue(sanitize(oldValue))
                    .newValue(sanitize(newValue))
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit logged: [{}] {} on {}:{}", module, action, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getLogs(Long businessId, Pageable pageable) {
        return auditLogRepository.findByBusinessIdOrderByCreatedAtDesc(businessId, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getLogs(Long businessId, String search, String module,
                                          String action, String entityType, Long userId,
                                          LocalDate dateFrom, LocalDate dateTo, Pageable pageable) {

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Multi-tenant business filter
            predicates.add(cb.equal(root.get("businessId"), businessId));

            if (module != null && !module.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("module")), module.trim().toUpperCase()));
            }

            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("action")), action.trim().toUpperCase()));
            }

            if (entityType != null && !entityType.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("entityType")), entityType.trim().toUpperCase()));
            }

            if (userId != null) {
                predicates.add(cb.equal(root.get("userId"), userId));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), dateFrom.atStartOfDay()));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), dateTo.atTime(LocalTime.MAX)));
            }

            if (search != null && !search.isBlank()) {
                String term = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("referenceNumber")), term),
                        cb.like(cb.lower(root.get("description")), term),
                        cb.like(cb.lower(root.get("username")), term),
                        cb.like(cb.lower(root.get("userEmail")), term),
                        cb.like(cb.lower(root.get("action")), term)
                );
                predicates.add(searchPred);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogResponse getLogById(Long businessId, Long id) {
        AuditLog log = auditLogRepository.findById(id)
                .filter(l -> l.getBusinessId() != null && l.getBusinessId().equals(businessId))
                .orElseThrow(() -> new ResourceNotFoundException("Audit log not found with id: " + id));

        return toResponse(log);
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .username(log.getUsername())
                .userEmail(log.getUserEmail())
                .module(log.getModule())
                .action(log.getAction())
                .recordId(log.getRecordId())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId())
                .referenceNumber(log.getReferenceNumber())
                .description(log.getDescription())
                .oldValue(log.getOldValue())
                .newValue(log.getNewValue())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .createdAt(log.getCreatedAt())
                .build();
    }

    /**
     * Sanitizes strings to strictly guard against leaking sensitive information.
     */
    private String sanitize(String input) {
        if (input == null) return null;
        return input.replaceAll("(?i)(\"?(password|passwordHash|securityCode|securityCodeHash|token|jwt)\"?\\s*[:=]\\s*)\"[^\"]+\"", "$1\"***REDACTED***\"")
                    .replaceAll("(?i)(\"?(password|passwordHash|securityCode|securityCodeHash|token|jwt)\"?\\s*[:=]\\s*)[^\\s,}]+", "$1***REDACTED***");
    }
}
