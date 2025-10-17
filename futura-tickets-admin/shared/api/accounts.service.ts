/**
 * Accounts Service
 * Handles all account management API calls
 */

'use client';

import { apiClient } from './client';
import { Account, CreateAccess } from '../interfaces';

export const accountsService = {
  /**
   * Get all admin accounts
   */
  async getAdminAccounts(): Promise<Account[]> {
    return apiClient.get('/api/accounts/admin');
  },

  /**
   * Create an access account for an event
   */
  async createAccessAccount(createAccessAccount: CreateAccess): Promise<Account> {
    return apiClient.post('/api/accounts/create-access', { createAccessAccount });
  },

  /**
   * Delete an admin account
   */
  async deleteAdminAccount(adminAccountId: string): Promise<any> {
    return apiClient.delete(`/api/accounts/admin/${adminAccountId}`);
  },
};
