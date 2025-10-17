'use client';
import {
  CreateEvent,
  DateTime,
  EditEvent,
  Event,
  EventStatus,
} from '../interfaces';

const API_URL = process.env.NEXT_PUBLIC_FUTURA;

/**
 * Get all events for the authenticated promoter
 */
export async function getEvents(): Promise<any> {
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
      console.error('Error fetching events:', err);
      return [];
    });
}

/**
 * Get a single event by ID
 */
export async function getEvent(event: string): Promise<Event> {
  return await fetch(`${API_URL}/api/events/${event}`, {
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
      console.error('Error fetching event:', err);
      throw err;
    });
}

/**
 * Create a new event
 */
export async function createEvent(createEvent: CreateEvent): Promise<Event> {
  return await fetch(`${API_URL}/api/events`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ createEvent }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Edit an existing event
 */
export async function editEvent(
  event: string,
  editEvent: EditEvent
): Promise<Event> {
  return await fetch(`${API_URL}/api/events/${event}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ editEvent }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Launch an event (make it live)
 */
export async function launchEvent(
  event: string,
  dateTime: DateTime
): Promise<Event> {
  return await fetch(`${API_URL}/api/launch/${event}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({
      event,
      updateEvent: { status: EventStatus.LAUNCHED, dateTime },
    }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Delete an event
 */
export async function deleteEvent(event: string): Promise<any> {
  return await fetch(`${API_URL}/api/events/${event}`, {
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
      console.error('Error deleting event:', err);
      throw err;
    });
}

/**
 * Get event for resale management
 */
export async function getEventResale(event: string): Promise<Event> {
  return await fetch(`${API_URL}/api/resale/${event}`, {
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
      console.error('Error fetching event resale:', err);
      throw err;
    });
}

/**
 * Enable or disable resale for an event
 */
export async function enableResale(
  event: string,
  status: boolean
): Promise<void> {
  return await fetch(`${API_URL}/api/resale/${event}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') as string}`,
    },
    body: JSON.stringify({ status }),
  })
    .then(async (response: Response) => {
      return await response.json();
    })
    .catch((err) => console.log(err));
}

/**
 * Export event data as CSV
 */
export const exportEventCSVRequest = async (eventId: string): Promise<void> => {
  try {
    return await fetch(`/api/export/event/${eventId}`, {
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
        console.error('Error exporting event CSV:', err);
        throw err;
      });
  } catch (error) {
    console.error('Error in exportEventCSVRequest:', error);
  }
};
