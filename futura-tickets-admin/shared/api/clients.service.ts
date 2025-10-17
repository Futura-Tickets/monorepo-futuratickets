/**
 * Clients Service
 * Handles all client-related API calls
 */

'use client';

import { apiClient } from './client';
import { PromoterClient } from '../interfaces';

export const clientsService = {
  /**
   * Get all clients for the current promoter
   */
  async getClients(): Promise<PromoterClient[]> {
    return apiClient.get('/api/clients');
  },

  /**
   * Get a single client by ID
   */
  async getClient(clientId: string): Promise<PromoterClient> {
    return apiClient.get(`/api/clients/${clientId}`);
  },

  /**
   * Export clients data to CSV
   */
  async exportClientsCSV(): Promise<void> {
    return apiClient.get('/api/export/clients');
  },
};
