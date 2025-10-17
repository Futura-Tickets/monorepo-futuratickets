'use client';
import { Order } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get all orders
 */
export async function getOrders(): Promise<any> {
  return await fetch(`${API_URL}/api/events`, {
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
      console.error('Error fetching orders:', err);
      return [];
    });
}

/**
 * Get a single order by ID
 */
export async function getOrder(order: string): Promise<Order> {
  return await fetch(`${API_URL}/api/orders/${order}`, {
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
      console.error('Error fetching order:', err);
      throw err;
    });
}

/**
 * Resend order confirmation email
 */
export const resendEmailOrder = async (orderId: string): Promise<boolean> => {
  return await fetch(`/api/orders/resend`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ orderId }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error resending order email:', err);
      return false;
    });
};
