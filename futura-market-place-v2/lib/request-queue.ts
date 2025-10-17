interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private processing = false;
  private maxConcurrent: number;
  private activeRequests = 0;
  private minDelay: number;
  private lastRequestTime = 0;

  constructor(maxConcurrent = 3, minDelay = 100) {
    this.maxConcurrent = maxConcurrent;
    this.minDelay = minDelay;
  }

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    if (this.activeRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;
    const request = this.queue.shift();

    if (!request) {
      this.processing = false;
      return;
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delay = Math.max(0, this.minDelay - timeSinceLastRequest);

    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
    this.activeRequests++;

    try {
      const result = await request.fn();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.activeRequests--;
      this.processing = false;
      this.processQueue();
    }
  }

  clear() {
    this.queue = [];
    this.activeRequests = 0;
  }

  get length() {
    return this.queue.length;
  }
}

export const requestQueue = new RequestQueue(5, 50);

export function queuedRequest<T>(fn: () => Promise<T>): Promise<T> {
  return requestQueue.add(fn);
}
