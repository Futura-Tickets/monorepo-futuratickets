'use client';
import { CreateInvitation, Order, Sale } from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get all invitations for an event
 */
export const getInvitations = async (eventId: string): Promise<Sale[]> => {
  return await fetch(`/api/invitations/${eventId}`, {
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
      console.error('Error fetching invitations:', err);
      return [];
    });
};

/**
 * Get event invitations (alternative endpoint)
 */
export async function getEventInvitations(event: string): Promise<Sale[]> {
  return await fetch(`${API_URL}/api/invitations/${event}`, {
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
      console.error('Error fetching event invitations:', err);
      return [];
    });
}

/**
 * Create a new invitation
 */
export async function createInvitation(
  createInvitation: CreateInvitation
): Promise<Order> {
  return await fetch(`${API_URL}/api/invitations/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(createInvitation),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error creating invitation:', err);
      throw err;
    });
}

/**
 * Delete an invitation
 */
export async function deleteInvitation(
  eventId: string,
  invitationId: string
): Promise<any> {
  return await fetch(
    `${API_URL}/api/invitations/${eventId}/${invitationId}`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  )
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => {
      console.error('Error deleting invitation:', err);
      throw err;
    });
}
