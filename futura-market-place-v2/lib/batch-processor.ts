interface BatchConfig {
  maxBatchSize?: number;
  maxWaitTime?: number;
}

export class BatchProcessor<T, R> {
  private queue: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (error: any) => void;
  }> = [];

  private timer: NodeJS.Timeout | null = null;
  private processing = false;

  constructor(
    private processor: (items: T[]) => Promise<R[]>,
    private config: BatchConfig = {}
  ) {
    this.config.maxBatchSize = config.maxBatchSize || 50;
    this.config.maxWaitTime = config.maxWaitTime || 100;
  }

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject });

      if (this.queue.length >= this.config.maxBatchSize!) {
        this.flush();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.config.maxWaitTime);
      }
    });
  }

  private async flush() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.processing = true;
    const batch = this.queue.splice(0, this.config.maxBatchSize);
    const items = batch.map((b) => b.item);

    try {
      const results = await this.processor(items);
      batch.forEach((b, i) => b.resolve(results[i]));
    } catch (error) {
      batch.forEach((b) => b.reject(error));
    } finally {
      this.processing = false;

      if (this.queue.length > 0) {
        setImmediate(() => this.flush());
      }
    }
  }

  clear() {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  get pending() {
    return this.queue.length;
  }
}
