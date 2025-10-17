/**
 * Invitations Service
 * Handles all invitation-related API calls
 */

'use client';

import { apiClient } from './client';
import { CreateInvitation, Order, Sale } from '../interfaces';

export const invitationsService = {
  /**
   * Get all invitations for an event
   */
  async getInvitations(eventId: string): Promise<Sale[]> {
    return apiClient.get(`/api/invitations/${eventId}`);
  },

  /**
   * Create a new invitation
   */
  async createInvitation(createInvitation: CreateInvitation): Promise<Order> {
    return apiClient.post('/api/invitations/create', createInvitation);
  },

  /**
   * Delete an invitation
   */
  async deleteInvitation(eventId: string, invitationId: string): Promise<any> {
    return apiClient.delete(`/api/invitations/${eventId}/${invitationId}`);
  },
};
