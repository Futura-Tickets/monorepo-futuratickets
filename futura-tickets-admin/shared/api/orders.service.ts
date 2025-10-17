/**
 * Orders Service
 * Handles all order-related API calls
 */

'use client';

import { apiClient } from './client';
import { Order } from '../interfaces';

export const ordersService = {
  /**
   * Get all orders for the current promoter
   */
  async getOrders(): Promise<Order[]> {
    return apiClient.get('/api/events');
  },

  /**
   * Get a single order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    return apiClient.get(`/api/orders/${orderId}`);
  },

  /**
   * Resend order confirmation email
   */
  async resendEmailOrder(orderId: string): Promise<boolean> {
    return apiClient.post('/api/orders/resend', { orderId });
  },
};
