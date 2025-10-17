'use client';
import { Notification } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (): Promise<Notification[]> => {
  return await fetch(`${API_URL}/api/notifications`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error fetching notifications:', err);
      return [];
    });
};

/**
 * Get notifications by order ID
 */
export const getNotificationsByOrderId = async (
  orderId: string
): Promise<Notification> => {
  try {
    const response = await fetch(`/api/notifications/order/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching notifications by order');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications by order:', error);
    throw error;
  }
};

/**
 * Get notifications by client ID
 */
export const getNotificationsByClientId = async (
  clientId: string
): Promise<Notification> => {
  try {
    const response = await fetch(`/api/notifications/client/${clientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error fetching notifications by client');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching notifications by client:', error);
    throw error;
  }
};

/**
 * Get notification by order ID (alternative endpoint)
 */
export const getNotificationByOrderId = async (
  orderId: string
): Promise<Notification> => {
  try {
    const response = await fetch(`/api/notifications/order/${orderId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Error fetching notification for order ${orderId}: ${response.statusText}`
      );
    }

    const notification: Notification = await response.json();
    return notification;
  } catch (error) {
    console.error(`Error fetching notification by order ID: ${error}`);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (
  notificationId: string,
  promoterId: string
): Promise<Notification> => {
  return await fetch(
    `${API_URL}/api/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ promoterId }),
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error marking notification as read:', err);
      throw err;
    });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  promoterId: string
): Promise<{ success: boolean }> => {
  return await fetch(`${API_URL}/api/notifications/read`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ promoterId }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error marking all notifications as read:', err);
      return { success: false };
    });
};
