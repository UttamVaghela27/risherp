package com.risherp.service.impl;

import com.risherp.dto.notification.NotificationResponse;
import com.risherp.entity.Business;
import com.risherp.entity.Item;
import com.risherp.entity.Notification;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.ItemRepository;
import com.risherp.repository.NotificationRepository;
import com.risherp.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final BusinessRepository businessRepository;
    private final ItemRepository itemRepository;

    @Override
    @Transactional
    public List<NotificationResponse> getNotifications(Long businessId, int page, int size) {
        // Auto-check for low stock alerts before fetching
        checkAndGenerateStockAlerts(businessId);

        List<Notification> list = notificationRepository.findByBusinessIdOrderByCreatedAtDesc(
                businessId, PageRequest.of(page, size)
        );

        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(Long businessId) {
        return notificationRepository.countByBusinessIdAndIsReadFalse(businessId);
    }

    @Override
    @Transactional
    public void markAsRead(Long id, Long businessId) {
        notificationRepository.findByIdAndBusinessId(id, businessId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long businessId) {
        notificationRepository.markAllAsRead(businessId);
    }

    @Override
    @Transactional
    public void createNotification(Long businessId, Long userId, String title, String message, String type, String link) {
        Business business = businessRepository.findById(businessId).orElse(null);
        if (business == null) {
            log.warn("Cannot create notification: Business with ID {} not found", businessId);
            return;
        }

        Notification notification = Notification.builder()
                .business(business)
                .userId(userId)
                .title(title)
                .message(message)
                .type(type != null ? type : "INFO")
                .link(link)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void checkAndGenerateStockAlerts(Long businessId) {
        try {
            List<Item> lowStockItems = itemRepository.findLowStockItems(businessId);
            if (lowStockItems == null || lowStockItems.isEmpty()) {
                return;
            }

            Business business = businessRepository.findById(businessId).orElse(null);
            if (business == null) return;

            for (Item item : lowStockItems) {
                String title = "Low Stock Alert: " + item.getItemName();
                boolean exists = notificationRepository.existsByBusinessIdAndTitleAndIsReadFalse(businessId, title);
                if (!exists) {
                    String msg = String.format("Item \"%s\" is low on stock! Current: %s %s (Min threshold: %s).",
                            item.getItemName(),
                            item.getCurrentStock(),
                            item.getUnit() != null ? item.getUnit() : "Units",
                            item.getMinimumStock());

                    Notification notif = Notification.builder()
                            .business(business)
                            .title(title)
                            .message(msg)
                            .type("WARNING")
                            .link("/items")
                            .isRead(false)
                            .build();

                    notificationRepository.save(notif);
                }
            }
        } catch (Exception ex) {
            log.error("Error generating stock alerts for business {}: {}", businessId, ex.getMessage());
        }
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .link(n.getLink())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .timeAgo(formatTimeAgo(n.getCreatedAt()))
                .build();
    }

    private String formatTimeAgo(LocalDateTime dt) {
        if (dt == null) return "Recently";
        Duration duration = Duration.between(dt, LocalDateTime.now());
        long seconds = duration.getSeconds();
        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        if (days < 7) return days + "d ago";
        return dt.toLocalDate().toString();
    }
}
