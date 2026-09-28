package com.risherp.dto.backup;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BackupResponse {
    private Long id;
    private String fileName;
    private Long fileSize;
    private String fileSizeFormatted;
    private String backupType;
    private String status;
    private String errorMessage;
    private Long createdBy;
    private String createdByName;
    private LocalDateTime createdAt;
}
