interface LoaderConfig<T> {
  batchSize?: number;
  dedupe?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

interface LoadRequest<K, T> {
  key: K;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

export class DataLoader<K, T> {
  private queue: LoadRequest<K, T>[] = [];
  private cache: Map<string, { data: T; expiresAt: number }> = new Map();
  private processing = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private batchLoadFn: (keys: K[]) => Promise<T[]>,
    private config: LoaderConfig<T> = {}
  ) {
    this.config.batchSize = config.batchSize || 100;
    this.config.dedupe = config.dedupe ?? true;
    this.config.cache = config.cache ?? true;
    this.config.cacheTTL = config.cacheTTL || 5 * 60 * 1000;
  }

  async load(key: K): Promise<T> {
    const cacheKey = JSON.stringify(key);

    if (this.config.cache) {
      const cached = this.cache.get(cacheKey);
      const now = Date.now();
      if (cached && cached.expiresAt > now) {
        return cached.data;
      }
    }

    if (this.config.dedupe) {
      const existing = this.queue.find(
        (req) => JSON.stringify(req.key) === cacheKey
      );
      if (existing) {
        return new Promise((resolve, reject) => {
          existing.resolve = resolve;
          existing.reject = reject;
        });
      }
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ key, resolve, reject });

      if (!this.timer) {
        this.timer = setTimeout(() => this.dispatch(), 10);
      }
    });
  }

  private async dispatch() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    this.timer = null;

    const batch = this.queue.splice(0, this.config.batchSize);
    const keys = batch.map((req) => req.key);

    try {
      const results = await this.batchLoadFn(keys);

      batch.forEach((req, index) => {
        const result = results[index];
        req.resolve(result);

        if (this.config.cache) {
          const cacheKey = JSON.stringify(req.key);
          const now = Date.now();
          this.cache.set(cacheKey, {
            data: result,
            expiresAt: now + this.config.cacheTTL!,
          });
        }
      });
    } catch (error) {
      batch.forEach((req) => req.reject(error));
    } finally {
      this.processing = false;

      if (this.queue.length > 0) {
        this.timer = setTimeout(() => this.dispatch(), 10);
      }
    }
  }

  clearCache(key?: K) {
    if (key) {
      const cacheKey = JSON.stringify(key);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }

  prime(key: K, value: T) {
    const cacheKey = JSON.stringify(key);
    const now = Date.now();
    this.cache.set(cacheKey, {
      data: value,
      expiresAt: now + this.config.cacheTTL!,
    });
  }
}
