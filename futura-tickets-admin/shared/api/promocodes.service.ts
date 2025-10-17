/**
 * Promo Codes Service
 * Handles all promo code-related API calls
 */

'use client';

import { apiClient } from './client';
import { PromoCode } from '../interfaces';

export const promoCodesService = {
  /**
   * Get all promo codes for an event
   */
  async getPromoCodes(eventId: string): Promise<PromoCode[]> {
    return apiClient.get(`/api/promocodes/${eventId}`);
  },

  /**
   * Create a new promo code
   */
  async createPromoCode(eventId: string, promoCodeData: any): Promise<PromoCode> {
    return apiClient.post('/api/promocodes/create', { eventId, ...promoCodeData });
  },

  /**
   * Delete a promo code
   */
  async deletePromoCode(eventId: string, promoCodeId: string): Promise<any> {
    return apiClient.delete(`/api/promocodes/${eventId}/${promoCodeId}`);
  },
};
