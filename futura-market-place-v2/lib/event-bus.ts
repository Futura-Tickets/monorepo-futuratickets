type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private events: Map<string, Set<EventCallback>> = new Map();

  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(callback);

    return () => this.off(event, callback);
  }

  off<T = any>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  emit<T = any>(event: string, data?: T): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  once<T = any>(event: string, callback: EventCallback<T>): () => void {
    const wrappedCallback = (data: T) => {
      callback(data);
      this.off(event, wrappedCallback);
    };

    return this.on(event, wrappedCallback);
  }

  clear(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }
}

export const eventBus = new EventBus();

export const APP_EVENTS = {
  CART_UPDATED: 'cart:updated',
  CART_CLEARED: 'cart:cleared',
  WISHLIST_UPDATED: 'wishlist:updated',
  USER_LOGGED_IN: 'user:logged-in',
  USER_LOGGED_OUT: 'user:logged-out',
  ORDER_CREATED: 'order:created',
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',
  TICKET_TRANSFERRED: 'ticket:transferred',
  TICKET_LISTED: 'ticket:listed',
  INVENTORY_UPDATED: 'inventory:updated',
} as const;
