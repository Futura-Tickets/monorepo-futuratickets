/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

'use client';

import { apiClient } from './client';
import { Account, CreateAccount, LoginAccount, TokenCheck } from '../interfaces';

export const authService = {
  /**
   * Create a new user account
   */
  async createAccount(createAccount: CreateAccount): Promise<any> {
    return apiClient.post('/api/accounts', { createAccount }, { skipAuth: true });
  },

  /**
   * Create a new promoter account
   */
  async createPromoterAccount(createPromoterAccount: CreateAccount): Promise<Account> {
    return apiClient.post('/api/accounts/create', { createPromoterAccount });
  },

  /**
   * Login with email and password
   */
  async login(loginAccount: LoginAccount): Promise<Account> {
    return apiClient.post('/api/accounts/login', { loginAccount }, { skipAuth: true });
  },

  /**
   * Login with Google OAuth
   */
  async loginGoogle(googleCode: string): Promise<Account> {
    return apiClient.post('/api/accounts/login-google', { googleCode }, { skipAuth: true });
  },

  /**
   * Validate JWT token expiration
   */
  async checkExpiration(): Promise<TokenCheck> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return apiClient.post('/api/accounts/validate', { token }, { skipAuth: true });
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<Account> {
    return apiClient.get('/api/accounts');
  },

  /**
   * Update user account
   */
  async updateAccount(account: any): Promise<any> {
    return apiClient.patch('/api/accounts/create', account);
  },
};
