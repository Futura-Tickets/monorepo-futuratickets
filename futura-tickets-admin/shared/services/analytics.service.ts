'use client';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get analytics data
 */
export async function getAnalytics(): Promise<any> {
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
      console.error('Error fetching analytics:', err);
      return {};
    });
}

/**
 * Get campaigns data
 */
export async function getCampaigns(): Promise<any> {
  return await fetch(`${API_URL}/api/campaigns`, {
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
      console.error('Error fetching campaigns:', err);
      return [];
    });
}
