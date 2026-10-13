package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.notification.NotificationResponse;
import com.risherp.security.UserPrincipal;
import com.risherp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * NotificationController
 * REST APIs for notifications, unread count badge, and mark-as-read actions.
 */
@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            Authentication authentication) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);

        List<NotificationResponse> list = notificationService.getNotifications(businessId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully", list));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication authentication) {
        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);

        long count = notificationService.getUnreadCount(businessId);
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched", Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);

        notificationService.markAsRead(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication authentication) {
        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);

        notificationService.markAllAsRead(businessId);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    private UserPrincipal getPrincipal(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    private Long getBusinessId(UserPrincipal principal) {
        if (principal != null && principal.getBusinessId() != null) {
            return principal.getBusinessId();
        }
        return 1L;
    }
}
