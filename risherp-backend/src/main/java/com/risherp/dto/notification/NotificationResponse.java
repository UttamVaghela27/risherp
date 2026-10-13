package com.risherp.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * NotificationResponse
 * DTO for sending notifications to client.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private String link;
    private boolean isRead;
    private LocalDateTime createdAt;
    private String timeAgo;
}
