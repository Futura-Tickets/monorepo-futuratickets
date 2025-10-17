/**
 * Events Service
 * Handles all event-related API calls
 */

'use client';

import { apiClient } from './client';
import { Event, CreateEvent, EditEvent, DateTime, EventStatus, Account } from '../interfaces';

export const eventsService = {
  /**
   * Get all events for the current promoter
   */
  async getEvents(): Promise<Event[]> {
    return apiClient.get('/api/events');
  },

  /**
   * Get a single event by ID
   */
  async getEvent(eventId: string): Promise<Event> {
    return apiClient.get(`/api/events/${eventId}`);
  },

  /**
   * Create a new event
   */
  async createEvent(createEvent: CreateEvent): Promise<Event> {
    return apiClient.post('/api/events', { createEvent });
  },

  /**
   * Edit an existing event
   */
  async editEvent(eventId: string, editEvent: EditEvent): Promise<Event> {
    return apiClient.patch(`/api/events/${eventId}`, { editEvent });
  },

  /**
   * Launch an event (change status to LAUNCHED)
   */
  async launchEvent(eventId: string, dateTime: DateTime): Promise<Event> {
    return apiClient.patch(`/api/launch/${eventId}`, {
      event: eventId,
      updateEvent: { status: EventStatus.LAUNCHED, dateTime },
    });
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string): Promise<any> {
    return apiClient.delete(`/api/events/${eventId}`);
  },

  /**
   * Get event access information
   */
  async getEventAccess(eventId: string): Promise<Event> {
    return apiClient.get(`/api/access/${eventId}`);
  },

  /**
   * Get accounts with access to event
   */
  async getEventAccessAccounts(eventId: string): Promise<Account[]> {
    return apiClient.get(`/api/access/accounts/${eventId}`);
  },

  /**
   * Get event resale information
   */
  async getEventResale(eventId: string): Promise<Event> {
    return apiClient.get(`/api/resale/${eventId}`);
  },

  /**
   * Enable or disable resale for an event
   */
  async enableResale(eventId: string, status: boolean): Promise<void> {
    return apiClient.patch(`/api/resale/${eventId}`, { status });
  },

  /**
   * Export event data to CSV
   */
  async exportEventCSV(eventId: string): Promise<void> {
    return apiClient.get(`/api/export/event/${eventId}`);
  },
};
