'use client';
import { PaymentMethod, RequestedPayment } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get all payments
 */
export async function getPayments(): Promise<any> {
  return await fetch(`${API_URL}/api/payments`, {
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
      console.error('Error fetching payments:', err);
      return [];
    });
}

// PAYMENT METHODS

/**
 * Get all payment methods for the authenticated user
 */
export const getPaymentMethods = async (): Promise<PaymentMethod[]> => {
  return await fetch('/api/payments/methods', {
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
      console.error('Error fetching payment methods:', err);
      return [];
    });
};

/**
 * Create a new payment method
 */
export const createPaymentMethod = async (
  paymentMethodData: any
): Promise<PaymentMethod> => {
  return await fetch('/api/payments/methods', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(paymentMethodData),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating payment method:', err);
      throw err;
    });
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (id: string): Promise<any> => {
  return await fetch(`/api/payments/methods/${id}`, {
    method: 'DELETE',
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
      console.error('Error deleting payment method:', err);
      throw err;
    });
};

// PAYMENT REQUESTS

/**
 * Get all payment requests (withdrawals)
 */
export const getPaymentRequests = async (): Promise<RequestedPayment[]> => {
  return await fetch('/api/payments/requests', {
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
      console.error('Error fetching payment requests:', err);
      return [];
    });
};

/**
 * Create a new payment request (withdrawal)
 */
export const createPaymentRequest = async (
  requestData: any
): Promise<RequestedPayment> => {
  return await fetch('/api/payments/requests', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(requestData),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating payment request:', err);
      throw err;
    });
};

/**
 * Delete a payment request
 */
export const deletePaymentRequest = async (requestId: string): Promise<any> => {
  return await fetch(`/api/payments/requests/${requestId}`, {
    method: 'DELETE',
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
      console.error('Error deleting payment request:', err);
      throw err;
    });
};
