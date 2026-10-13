package com.risherp.service;

import com.risherp.dto.notification.NotificationResponse;
import java.util.List;

public interface NotificationService {

    List<NotificationResponse> getNotifications(Long businessId, int page, int size);

    long getUnreadCount(Long businessId);

    void markAsRead(Long id, Long businessId);

    void markAllAsRead(Long businessId);

    void createNotification(Long businessId, Long userId, String title, String message, String type, String link);

    void checkAndGenerateStockAlerts(Long businessId);
}
