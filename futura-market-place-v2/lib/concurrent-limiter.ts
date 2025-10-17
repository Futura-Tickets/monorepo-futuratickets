export class ConcurrentLimiter {
  private running = 0;
  private queue: Array<() => void> = [];

  constructor(private maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.running++;

    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }

  get activeCount(): number {
    return this.running;
  }

  get queuedCount(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue.forEach(resolve => resolve());
    this.queue = [];
  }
}

const limiters = new Map<string, ConcurrentLimiter>();

export function getConcurrentLimiter(key: string, maxConcurrent = 3): ConcurrentLimiter {
  if (!limiters.has(key)) {
    limiters.set(key, new ConcurrentLimiter(maxConcurrent));
  }
  return limiters.get(key)!;
}

export async function withConcurrencyLimit<T>(
  key: string,
  fn: () => Promise<T>,
  maxConcurrent = 3
): Promise<T> {
  const limiter = getConcurrentLimiter(key, maxConcurrent);
  return limiter.run(fn);
}
