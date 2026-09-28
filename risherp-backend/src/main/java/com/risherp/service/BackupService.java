package com.risherp.service;

import com.risherp.dto.backup.BackupResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BackupService {

    BackupResponse createBackup(Long businessId, Long userId, String userName, String backupType);

    Page<BackupResponse> getBackups(Long businessId, Pageable pageable);

    BackupResponse getBackupById(Long businessId, Long backupId);

    byte[] downloadBackup(Long businessId, Long backupId);

    String getBackupFileName(Long businessId, Long backupId);

    BackupResponse restoreBackup(Long businessId, Long backupId, Long userId, String userName);
}
