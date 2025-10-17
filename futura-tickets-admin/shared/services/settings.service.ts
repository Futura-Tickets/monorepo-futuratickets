'use client';
import { ApiSettings } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Enable or disable API access
 */
export async function enableDisableApi(
  apiEnabled: boolean
): Promise<ApiSettings> {
  return await fetch(`${API_URL}/api/promoter`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ apiEnabled }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Get Futura API settings
 */
export const getFuturaApiSettings = async (): Promise<ApiSettings> => {
  return await fetch(`${API_URL}/api/promoter`, {
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
      console.error('Error fetching API settings:', err);
      throw err;
    });
};
