/**
 * Sales Service
 * Handles all sales/tickets-related API calls
 */

'use client';

import { apiClient } from './client';
import { Sale } from '../interfaces';

export const salesService = {
  /**
   * Get all sales for the current promoter
   */
  async getSales(): Promise<Sale[]> {
    return apiClient.get('/api/sales');
  },

  /**
   * Get a single sale by ID
   */
  async getSale(saleId: string): Promise<Sale> {
    return apiClient.get(`/api/sales/${saleId}`);
  },

  /**
   * Get event invitations
   */
  async getEventInvitations(eventId: string): Promise<Sale[]> {
    return apiClient.get(`/api/invitations/${eventId}`);
  },
};
