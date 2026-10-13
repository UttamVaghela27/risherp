import axiosInstance from '../api/axiosInstance';

/**
 * Notification Service
 * Client for fetching notifications, unread count, and marking notifications as read.
 */
export const notificationService = {
  /**
   * Fetch recent notifications
   */
  getNotifications: async (page = 0, size = 20) => {
    const response = await axiosInstance.get('/notifications', { params: { page, size } });
    return response.data;
  },

  /**
   * Fetch unread notification count for the badge
   */
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark a specific notification as read
   */
  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async () => {
    const response = await axiosInstance.put('/notifications/mark-all-read');
    return response.data;
  },
};

export default notificationService;
