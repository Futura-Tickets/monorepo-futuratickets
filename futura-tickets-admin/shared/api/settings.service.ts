/**
 * Settings Service
 * Handles all settings-related API calls
 */

'use client';

import { apiClient } from './client';
import { ApiSettings } from '../interfaces';

export const settingsService = {
  /**
   * Get API settings for the current promoter
   */
  async getFuturaApiSettings(): Promise<ApiSettings> {
    return apiClient.get('/api/promoter');
  },

  /**
   * Enable or disable API access
   */
  async enableDisableApi(apiEnabled: boolean): Promise<ApiSettings> {
    return apiClient.patch('/api/promoter', { apiEnabled });
  },
};
