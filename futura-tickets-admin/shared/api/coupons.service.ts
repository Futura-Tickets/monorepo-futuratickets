/**
 * Coupons Service
 * Handles all coupon-related API calls
 */

'use client';

import { apiClient } from './client';
import { Coupon } from '../interfaces';

export const couponsService = {
  /**
   * Get all coupons for an event
   */
  async getCoupons(eventId: string): Promise<Coupon[]> {
    return apiClient.get(`/api/coupons/${eventId}`);
  },

  /**
   * Create a new coupon
   */
  async createCoupon(eventId: string, couponData: any): Promise<Coupon> {
    return apiClient.post('/api/coupons/create', { eventId, ...couponData });
  },

  /**
   * Delete a coupon
   */
  async deleteCoupon(eventId: string, couponCode: string): Promise<any> {
    return apiClient.delete(`/api/coupons/${eventId}/${couponCode}`);
  },
};
