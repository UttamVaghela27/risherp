package com.risherp.service.impl;

import com.risherp.dto.backup.BackupResponse;
import com.risherp.entity.DatabaseBackup;
import com.risherp.exception.BackupException;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.DatabaseBackupRepository;
import com.risherp.service.AuditLogService;
import com.risherp.service.BackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class BackupServiceImpl implements BackupService {

    private final DatabaseBackupRepository databaseBackupRepository;
    private final AuditLogService auditLogService;

    @Value("${spring.datasource.url:jdbc:mysql://localhost:3306/risherp_db}")
    private String dbUrl;

    @Value("${spring.datasource.username:root}")
    private String dbUsername;

    @Value("${spring.datasource.password:root}")
    private String dbPassword;

    private static final String BACKUP_DIR_PATH = "backups";
    private static final DateTimeFormatter FILE_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss");

    private static final String DEFAULT_MYSQLDUMP_PATH = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe";
    private static final String DEFAULT_MYSQL_PATH = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe";

    @Override
    @Transactional
    public BackupResponse createBackup(Long businessId, Long userId, String userName, String backupType) {
        log.info("Initiating database backup for business: {}, type: {}", businessId, backupType);

        String type = (backupType != null && !backupType.isBlank()) ? backupType.toUpperCase() : "MANUAL";
        String prefix = "PRE_RESTORE_SAFETY".equals(type) ? "RISHERP_SAFETY_BACKUP_" : "RISHERP_BACKUP_";
        String timestamp = LocalDateTime.now().format(FILE_DATE_FORMAT);
        String fileName = prefix + timestamp + ".sql";

        File backupDir = getAndEnsureBackupDir();
        File targetFile = new File(backupDir, fileName);
        File logFile = new File(backupDir, "backup_exec_" + timestamp + ".log");

        String mysqldumpExec = resolveMysqldumpExecutable();
        DbConnectionInfo dbInfo = parseDbUrl(dbUrl);

        List<String> command = new ArrayList<>();
        command.add(mysqldumpExec);
        command.add("-u" + dbUsername);
        if (dbPassword != null && !dbPassword.isEmpty()) {
            command.add("-p" + dbPassword);
        }
        command.add("-h" + dbInfo.host());
        command.add("-P" + dbInfo.port());
        command.add("--routines");
        command.add("--triggers");
        command.add("--single-transaction");
        command.add(dbInfo.database());

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectOutput(targetFile);
        processBuilder.redirectError(logFile);

        DatabaseBackup record = DatabaseBackup.builder()
                .businessId(businessId)
                .fileName(fileName)
                .filePath(targetFile.getAbsolutePath())
                .fileSize(0L)
                .backupType(type)
                .status("IN_PROGRESS")
                .createdBy(userId)
                .createdByName(userName)
                .build();
        record = databaseBackupRepository.save(record);

        try {
            Process process = processBuilder.start();
            boolean finished = process.waitFor(180, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                record.setStatus("FAILED");
                record.setErrorMessage("Backup process timed out after 180 seconds.");
                databaseBackupRepository.save(record);
                log.error("Backup timed out for business {}", businessId);
                throw new BackupException("Backup timed out. Please verify database server connectivity.");
            }

            int exitCode = process.exitValue();
            if (exitCode != 0 || !targetFile.exists() || targetFile.length() == 0) {
                String errorDetails = readExecutionError(logFile);
                record.setStatus("FAILED");
                record.setErrorMessage("mysqldump failed with code " + exitCode + ": " + errorDetails);
                databaseBackupRepository.save(record);
                log.error("Backup failed for business {}: code={}, error={}", businessId, exitCode, errorDetails);
                throw new BackupException("Database backup failed. " + errorDetails);
            }

            long fileSize = targetFile.length();
            record.setFileSize(fileSize);
            record.setStatus("COMPLETED");
            record = databaseBackupRepository.save(record);

            auditLogService.record(userId, userName, null, businessId,
                    "BACKUP", "BACKUP_CREATED", "DATABASE_BACKUP", String.valueOf(record.getId()),
                    fileName, "Created database backup: " + fileName + " (" + formatFileSize(fileSize) + ")",
                    null, null, null, null);

            log.info("Database backup completed successfully: {} ({} bytes)", fileName, fileSize);
            return toResponse(record);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            record.setStatus("FAILED");
            record.setErrorMessage("Backup thread interrupted.");
            databaseBackupRepository.save(record);
            throw new BackupException("Backup interrupted: " + e.getMessage());
        } catch (IOException e) {
            record.setStatus("FAILED");
            record.setErrorMessage("I/O failure during backup: " + e.getMessage());
            databaseBackupRepository.save(record);
            log.error("I/O failure during backup: {}", e.getMessage(), e);
            throw new BackupException("Failed to execute database backup utility: " + e.getMessage());
        } finally {
            if (logFile.exists() && logFile.length() == 0) {
                logFile.delete();
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BackupResponse> getBackups(Long businessId, Pageable pageable) {
        return databaseBackupRepository.findByBusinessIdOrderByCreatedAtDesc(businessId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BackupResponse getBackupById(Long businessId, Long backupId) {
        DatabaseBackup record = getBackupRecordOrThrow(businessId, backupId);
        return toResponse(record);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadBackup(Long businessId, Long backupId) {
        DatabaseBackup record = getBackupRecordOrThrow(businessId, backupId);

        if (!"COMPLETED".equalsIgnoreCase(record.getStatus()) && !"RESTORED".equalsIgnoreCase(record.getStatus())) {
            throw new BadRequestException("Cannot download backup with status: " + record.getStatus());
        }

        File targetFile = resolveSafeFile(record.getFileName());
        if (!targetFile.exists() || !targetFile.isFile()) {
            throw new ResourceNotFoundException("Backup file no longer exists on storage: " + record.getFileName());
        }

        try {
            return Files.readAllBytes(targetFile.toPath());
        } catch (IOException e) {
            log.error("Failed to read backup file {}: {}", record.getFileName(), e.getMessage(), e);
            throw new RuntimeException("Failed to read backup file: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getBackupFileName(Long businessId, Long backupId) {
        DatabaseBackup record = getBackupRecordOrThrow(businessId, backupId);
        return record.getFileName();
    }

    @Override
    @Transactional
    public BackupResponse restoreBackup(Long businessId, Long backupId, Long userId, String userName) {
        log.warn("RESTORE REQUESTED for business {} by user {} (ID: {}) on backup ID {}",
                businessId, userName, userId, backupId);

        DatabaseBackup record = getBackupRecordOrThrow(businessId, backupId);

        if (!"COMPLETED".equalsIgnoreCase(record.getStatus()) && !"RESTORED".equalsIgnoreCase(record.getStatus())) {
            throw new BadRequestException("Only COMPLETED or RESTORED backups can be restored. Current status: " + record.getStatus());
        }

        File backupFile = resolveSafeFile(record.getFileName());
        if (!backupFile.exists() || !backupFile.isFile() || backupFile.length() == 0) {
            throw new ResourceNotFoundException("Backup dump file not found or is empty: " + record.getFileName());
        }

        // STEP 1: MANDATORY SAFETY BACKUP BEFORE RESTORE
        log.info("Creating automatic pre-restore safety backup...");
        BackupResponse safetyBackup;
        try {
            safetyBackup = createBackup(businessId, userId, userName, "PRE_RESTORE_SAFETY");
            log.info("Pre-restore safety backup successfully created: {}", safetyBackup.getFileName());
        } catch (Exception e) {
            log.error("Pre-restore safety backup FAILED! Aborting restore operation immediately.", e);
            throw new BackupException("Restore aborted: Failed to create pre-restore safety backup of active database.");
        }

        // STEP 2: RESTORE THE DATABASE USING MYSQL EXECUTABLE
        String mysqlExec = resolveMysqlExecutable();
        DbConnectionInfo dbInfo = parseDbUrl(dbUrl);
        String timestamp = LocalDateTime.now().format(FILE_DATE_FORMAT);
        File backupDir = getAndEnsureBackupDir();
        File errorLogFile = new File(backupDir, "restore_exec_" + timestamp + ".log");

        List<String> command = new ArrayList<>();
        command.add(mysqlExec);
        command.add("-u" + dbUsername);
        if (dbPassword != null && !dbPassword.isEmpty()) {
            command.add("-p" + dbPassword);
        }
        command.add("-h" + dbInfo.host());
        command.add("-P" + dbInfo.port());
        command.add(dbInfo.database());

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectInput(backupFile);
        pb.redirectError(errorLogFile);

        try {
            Process process = pb.start();
            boolean finished = process.waitFor(300, TimeUnit.SECONDS);

            if (!finished) {
                process.destroyForcibly();
                log.error("Restore process timed out after 300 seconds");
                throw new BackupException("Restore process timed out. Safety backup is available at: " + safetyBackup.getFileName());
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                String errorDetails = readExecutionError(errorLogFile);
                log.error("mysql restore failed with code {}: {}", exitCode, errorDetails);
                throw new BackupException("Restore command failed (code " + exitCode + "): " + errorDetails);
            }

            record.setStatus("RESTORED");
            DatabaseBackup updated = databaseBackupRepository.save(record);

            auditLogService.record(userId, userName, null, businessId,
                    "BACKUP", "BACKUP_RESTORED", "DATABASE_BACKUP", String.valueOf(record.getId()),
                    record.getFileName(), "Restored ERP database from backup: " + record.getFileName() +
                    ". Pre-restore safety backup created: " + safetyBackup.getFileName(),
                    null, null, null, null);

            log.info("Database restore successfully completed for backup ID {}", backupId);
            return toResponse(updated);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BackupException("Restore process interrupted: " + e.getMessage());
        } catch (IOException e) {
            log.error("I/O error during restore: {}", e.getMessage(), e);
            throw new BackupException("Failed to execute database restore utility: " + e.getMessage());
        } finally {
            if (errorLogFile.exists() && errorLogFile.length() == 0) {
                errorLogFile.delete();
            }
        }
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private DatabaseBackup getBackupRecordOrThrow(Long businessId, Long backupId) {
        return databaseBackupRepository.findByIdAndBusinessId(backupId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Backup record not found with id: " + backupId));
    }

    private File getAndEnsureBackupDir() {
        File dir = new File(BACKUP_DIR_PATH);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return dir;
    }

    /**
     * Resolves target file and strictly verifies that path traversal is prevented.
     */
    private File resolveSafeFile(String fileName) {
        if (fileName == null || fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new BadRequestException("Invalid or suspicious backup file name: " + fileName);
        }

        File backupDir = getAndEnsureBackupDir();
        File target = new File(backupDir, fileName);

        try {
            String dirCanonical = backupDir.getCanonicalPath();
            String fileCanonical = target.getCanonicalPath();
            if (!fileCanonical.startsWith(dirCanonical)) {
                throw new SecurityException("Path traversal attempt detected!");
            }
        } catch (IOException e) {
            throw new BadRequestException("Could not verify backup file path: " + e.getMessage());
        }

        return target;
    }

    private String resolveMysqldumpExecutable() {
        if (new File(DEFAULT_MYSQLDUMP_PATH).exists()) {
            return DEFAULT_MYSQLDUMP_PATH;
        }
        return "mysqldump";
    }

    private String resolveMysqlExecutable() {
        if (new File(DEFAULT_MYSQL_PATH).exists()) {
            return DEFAULT_MYSQL_PATH;
        }
        return "mysql";
    }

    private DbConnectionInfo parseDbUrl(String url) {
        // Regex to parse host, port, database from JDBC MySQL URL
        Pattern pattern = Pattern.compile("jdbc:mysql://([^:/]+)(?::(\\d+))?/([^?]+)");
        Matcher matcher = pattern.matcher(url);

        String host = "localhost";
        String port = "3306";
        String db = "risherp_db";

        if (matcher.find()) {
            host = matcher.group(1);
            if (matcher.group(2) != null) {
                port = matcher.group(2);
            }
            db = matcher.group(3);
        }

        return new DbConnectionInfo(host, port, db);
    }

    private record DbConnectionInfo(String host, String port, String database) {}

    private String readExecutionError(File logFile) {
        if (!logFile.exists() || logFile.length() == 0) {
            return "No output captured.";
        }
        try {
            List<String> lines = Files.readAllLines(logFile.toPath());
            String sanitized = String.join(" ", lines)
                    .replaceAll("-p[^\\s]+", "-p***REDACTED***");
            return sanitized.length() > 300 ? sanitized.substring(0, 300) + "..." : sanitized;
        } catch (Exception e) {
            return "Unable to read error log.";
        }
    }

    private String formatFileSize(Long bytes) {
        if (bytes == null || bytes <= 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return new DecimalFormat("#,##0.0").format(bytes / 1024.0) + " KB";
        return new DecimalFormat("#,##0.00").format(bytes / (1024.0 * 1024.0)) + " MB";
    }

    private BackupResponse toResponse(DatabaseBackup b) {
        return BackupResponse.builder()
                .id(b.getId())
                .fileName(b.getFileName())
                .fileSize(b.getFileSize())
                .fileSizeFormatted(formatFileSize(b.getFileSize()))
                .backupType(b.getBackupType())
                .status(b.getStatus())
                .errorMessage(b.getErrorMessage())
                .createdBy(b.getCreatedBy())
                .createdByName(b.getCreatedByName())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
