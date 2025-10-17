type UpdateFn<T> = (current: T) => T;
type RollbackFn<T> = (previous: T) => void;

interface OptimisticUpdate<T> {
  id: string;
  update: UpdateFn<T>;
  rollback: RollbackFn<T>;
  previousValue: T;
  timestamp: number;
}

export class OptimisticUpdateManager<T> {
  private updates: Map<string, OptimisticUpdate<T>> = new Map();
  private currentValue: T;

  constructor(initialValue: T) {
    this.currentValue = initialValue;
  }

  apply(id: string, updateFn: UpdateFn<T>, rollbackFn?: RollbackFn<T>): T {
    const previousValue = this.currentValue;
    const newValue = updateFn(this.currentValue);

    this.updates.set(id, {
      id,
      update: updateFn,
      rollback: rollbackFn || (() => {}),
      previousValue,
      timestamp: Date.now(),
    });

    this.currentValue = newValue;
    return newValue;
  }

  async commit(id: string, serverUpdate: () => Promise<T>): Promise<T> {
    const update = this.updates.get(id);
    if (!update) {
      throw new Error(`No optimistic update found with id: ${id}`);
    }

    try {
      const serverValue = await serverUpdate();
      this.updates.delete(id);
      this.currentValue = serverValue;
      return serverValue;
    } catch (error) {
      this.rollback(id);
      throw error;
    }
  }

  rollback(id: string): void {
    const update = this.updates.get(id);
    if (!update) {
      return;
    }

    update.rollback(update.previousValue);
    this.currentValue = update.previousValue;
    this.updates.delete(id);
  }

  rollbackAll(): void {
    const updateIds = Array.from(this.updates.keys());
    updateIds.forEach(id => this.rollback(id));
  }

  getValue(): T {
    return this.currentValue;
  }

  hasPending(): boolean {
    return this.updates.size > 0;
  }

  getPendingCount(): number {
    return this.updates.size;
  }
}

export function createOptimisticManager<T>(initialValue: T) {
  return new OptimisticUpdateManager<T>(initialValue);
}
