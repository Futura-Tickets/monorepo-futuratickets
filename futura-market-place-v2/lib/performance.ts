export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples = 100;

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }

  private recordMetric(name: string, duration: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const samples = this.metrics.get(name)!;
    samples.push(duration);

    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }

  getStats(name: string) {
    const samples = this.metrics.get(name);
    if (!samples || samples.length === 0) {
      return null;
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    return {
      avg: sum / sorted.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      samples: sorted.length,
    };
  }

  clear(name?: string) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    this.metrics.forEach((_, name) => {
      stats[name] = this.getStats(name);
    });
    return stats;
  }
}

export const perfMonitor = new PerformanceMonitor();

export function measureRender(componentName: string) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      componentDidMount() {
        perfMonitor.recordMetric(`${componentName}.mount`, performance.now());
        if (super.componentDidMount) {
          super.componentDidMount();
        }
      }
    };
  };
}
