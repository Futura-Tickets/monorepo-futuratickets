'use client';
import { Account, Event } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get access accounts for an event
 */
export async function getEventAccessAccounts(
  event: string
): Promise<Account[]> {
  return await fetch(`${API_URL}/api/access/accounts/${event}`, {
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
      console.error('Error fetching event access accounts:', err);
      return [];
    });
}

/**
 * Get event access information
 */
export async function getEventAccess(event: string): Promise<Event> {
  return await fetch(`${API_URL}/api/access/${event}`, {
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
      console.error('Error fetching event access:', err);
      throw err;
    });
}
