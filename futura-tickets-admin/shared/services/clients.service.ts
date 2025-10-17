'use client';
import { PromoterClient } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get all clients for the authenticated promoter
 */
export async function getClients(): Promise<PromoterClient[]> {
  return await fetch(`${API_URL}/api/clients`, {
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
      console.error('Error fetching clients:', err);
      return [];
    });
}

/**
 * Get a single client by ID
 */
export async function getClient(client: string): Promise<PromoterClient> {
  return await fetch(`${API_URL}/api/clients/${client}`, {
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
      console.error('Error fetching client:', err);
      throw err;
    });
}

/**
 * Export clients data as CSV
 */
export const exportClientsCSVRequest = async (): Promise<void> => {
  try {
    return await fetch(`/api/export/clients`, {
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
        console.error('Error exporting clients CSV:', err);
        throw err;
      });
  } catch (error) {
    console.error('Error in exportClientsCSVRequest:', error);
  }
};
