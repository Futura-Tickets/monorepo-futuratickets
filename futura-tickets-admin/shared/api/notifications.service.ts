/**
 * Notifications Service
 * Handles all notification-related API calls
 */

'use client';

import { apiClient } from './client';
import { Notification } from '../interfaces';

export const notificationsService = {
  /**
   * Get all notifications for the current promoter
   */
  async getNotifications(): Promise<Notification[]> {
    return apiClient.get('/api/notifications');
  },

  /**
   * Get notifications by order ID
   */
  async getNotificationsByOrderId(orderId: string): Promise<Notification> {
    return apiClient.get(`/api/notifications/order/${orderId}`);
  },

  /**
   * Get notifications by client ID
   */
  async getNotificationsByClientId(clientId: string): Promise<Notification> {
    return apiClient.get(`/api/notifications/client/${clientId}`);
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, promoterId: string): Promise<Notification> {
    return apiClient.patch(`/api/notifications/${notificationId}/read`, { promoterId });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(promoterId: string): Promise<{ success: boolean }> {
    return apiClient.patch('/api/notifications/read', { promoterId });
  },
};
