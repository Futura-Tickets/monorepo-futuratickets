'use client';
import { Sale } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get all sales for the authenticated promoter
 */
export async function getSales(): Promise<Sale[]> {
  return await fetch(`${API_URL}/api/sales`, {
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
      console.error('Error fetching sales:', err);
      return [];
    });
}

/**
 * Get a single sale by ID
 */
export async function getSale(sale: string): Promise<Sale> {
  return await fetch(`${API_URL}/api/sales/${sale}`, {
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
      console.error('Error fetching sale:', err);
      throw err;
    });
}
