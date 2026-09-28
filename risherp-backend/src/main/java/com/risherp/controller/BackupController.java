package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.backup.BackupResponse;
import com.risherp.security.UserPrincipal;
import com.risherp.service.BackupService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/backups")
@RequiredArgsConstructor
public class BackupController {

    private final BackupService backupService;

    @GetMapping
    @PreAuthorize("hasAuthority('BACKUP_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<BackupResponse>>> getBackups(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<BackupResponse> backups = backupService.getBackups(
                principal.getBusinessId(),
                PageRequest.of(page, size, Sort.by("createdAt").descending()));

        return ResponseEntity.ok(ApiResponse.success("Backups retrieved", PagedResponse.from(backups)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('BACKUP_CREATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BackupResponse>> createBackup(
            @AuthenticationPrincipal UserPrincipal principal) {
        BackupResponse response = backupService.createBackup(
                principal.getBusinessId(), principal.getId(), principal.getName(), "MANUAL");

        return ResponseEntity.ok(ApiResponse.success("Database backup created successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('BACKUP_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BackupResponse>> getBackupById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Backup details retrieved",
                backupService.getBackupById(principal.getBusinessId(), id)));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAuthority('BACKUP_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadBackup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        byte[] data = backupService.downloadBackup(principal.getBusinessId(), id);
        String fileName = backupService.getBackupFileName(principal.getBusinessId(), id);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('BACKUP_RESTORE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BackupResponse>> restoreBackup(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BackupResponse response = backupService.restoreBackup(
                principal.getBusinessId(), id, principal.getId(), principal.getName());

        return ResponseEntity.ok(ApiResponse.success("Database restored successfully", response));
    }
}
