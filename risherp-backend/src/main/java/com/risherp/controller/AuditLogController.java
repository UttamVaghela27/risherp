package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.audit.AuditLogResponse;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW') or hasAuthority('AUDIT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> getAuditLogs(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageRequest = PageRequest.of(page, size, sort);

        Page<AuditLogResponse> logs = auditLogService.getLogs(
                principal.getBusinessId(), search, module, action, entityType, userId, dateFrom, dateTo, pageRequest);

        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", PagedResponse.from(logs)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('AUDIT_LOG_VIEW') or hasAuthority('AUDIT_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getAuditLogById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Audit log details retrieved",
                auditLogService.getLogById(principal.getBusinessId(), id)));
    }
}
