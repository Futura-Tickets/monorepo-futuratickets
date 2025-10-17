interface LockEntry {
  eventId: string;
  ticketType: string;
  quantity: number;
  expiresAt: number;
  sessionId: string;
}

class InventoryLockManager {
  private locks: Map<string, LockEntry> = new Map();
  private readonly lockDuration = 10 * 60 * 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startCleanup();
  }

  private generateSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${timestamp}-${random}`;
  }

  async acquireLock(eventId: string, ticketType: string, quantity: number): Promise<boolean> {
    const key = `${eventId}:${ticketType}`;
    const existing = this.locks.get(key);
    const now = Date.now();

    if (existing && existing.expiresAt > now) {
      if (existing.sessionId === this.sessionId) {
        existing.quantity = quantity;
        existing.expiresAt = now + this.lockDuration;
        return true;
      }
      return false;
    }

    this.locks.set(key, {
      eventId,
      ticketType,
      quantity,
      expiresAt: now + this.lockDuration,
      sessionId: this.sessionId,
    });

    return true;
  }

  releaseLock(eventId: string, ticketType: string): void {
    const key = `${eventId}:${ticketType}`;
    const lock = this.locks.get(key);
    
    if (lock && lock.sessionId === this.sessionId) {
      this.locks.delete(key);
    }
  }

  releaseAllLocks(): void {
    const keys = Array.from(this.locks.keys());
    keys.forEach(key => {
      const lock = this.locks.get(key);
      if (lock && lock.sessionId === this.sessionId) {
        this.locks.delete(key);
      }
    });
  }

  extendLock(eventId: string, ticketType: string): boolean {
    const key = `${eventId}:${ticketType}`;
    const lock = this.locks.get(key);
    const now = Date.now();

    if (lock && lock.sessionId === this.sessionId) {
      lock.expiresAt = now + this.lockDuration;
      return true;
    }

    return false;
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const keys = Array.from(this.locks.keys());
      
      keys.forEach(key => {
        const lock = this.locks.get(key);
        if (lock && lock.expiresAt < now) {
          this.locks.delete(key);
        }
      });
    }, 60000);
  }

  getActiveLocks(): LockEntry[] {
    const now = Date.now();
    return Array.from(this.locks.values()).filter(lock => 
      lock.sessionId === this.sessionId && lock.expiresAt > now
    );
  }
}

export const inventoryLock = new InventoryLockManager();
