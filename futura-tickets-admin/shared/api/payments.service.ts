/**
 * Payments Service
 * Handles all payment-related API calls
 */

'use client';

import { apiClient } from './client';
import { PaymentMethod, RequestedPayment } from '../interfaces';

export const paymentsService = {
  /**
   * Get all payments
   */
  async getPayments(): Promise<any> {
    return apiClient.get('/api/payments');
  },

  /**
   * Get all payment methods
   */
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return apiClient.get('/api/payments/methods');
  },

  /**
   * Create a new payment method
   */
  async createPaymentMethod(paymentMethodData: any): Promise<PaymentMethod> {
    return apiClient.post('/api/payments/methods', paymentMethodData);
  },

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(methodId: string): Promise<any> {
    return apiClient.delete(`/api/payments/methods/${methodId}`);
  },

  /**
   * Get all payment requests
   */
  async getPaymentRequests(): Promise<RequestedPayment[]> {
    return apiClient.get('/api/payments/requests');
  },

  /**
   * Create a new payment request
   */
  async createPaymentRequest(requestData: any): Promise<RequestedPayment> {
    return apiClient.post('/api/payments/requests', requestData);
  },

  /**
   * Delete a payment request
   */
  async deletePaymentRequest(requestId: string): Promise<any> {
    return apiClient.delete(`/api/payments/requests/${requestId}`);
  },
};
