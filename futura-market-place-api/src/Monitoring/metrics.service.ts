import { Injectable } from '@nestjs/common';

interface RequestMetricKey {
  method: string;
  route: string;
  status: number;
}

interface RequestMetricValue {
  count: number;
  totalDurationMs: number;
}

@Injectable()
export class MetricsService {
  private readonly requests = new Map<string, RequestMetricValue>();

  recordRequest(
    method: string,
    route: string,
    status: number,
    durationMs: number,
  ): void {
    const key = this.buildKey({ method, route, status });
    const current = this.requests.get(key) ?? { count: 0, totalDurationMs: 0 };

    current.count += 1;
    current.totalDurationMs += durationMs;

    this.requests.set(key, current);
  }

  serialize(): string {
    const lines: string[] = [
      '# HELP http_requests_total Total number of HTTP requests processed by the service',
      '# TYPE http_requests_total counter',
      '# HELP http_request_duration_milliseconds_sum Total duration of HTTP requests in milliseconds',
      '# TYPE http_request_duration_milliseconds_sum gauge',
      '# HELP http_request_duration_milliseconds_avg Average duration of HTTP requests in milliseconds',
      '# TYPE http_request_duration_milliseconds_avg gauge',
    ];

    for (const [key, value] of this.requests.entries()) {
      const { method, route, status } = this.parseKey(key);
      const labels = this.formatLabels(method, route, status);
      const average =
        value.count === 0 ? 0 : value.totalDurationMs / value.count;

      lines.push(`http_requests_total${labels} ${value.count}`);
      lines.push(
        `http_request_duration_milliseconds_sum${labels} ${value.totalDurationMs.toFixed(
          3,
        )}`,
      );
      lines.push(
        `http_request_duration_milliseconds_avg${labels} ${average.toFixed(3)}`,
      );
    }

    return `${lines.join('\n')}\n`;
  }

  private buildKey(key: RequestMetricKey): string {
    return `${key.method}::${key.route}::${key.status}`;
  }

  private parseKey(key: string): RequestMetricKey {
    const [method, route, status] = key.split('::');
    return {
      method,
      route,
      status: Number(status),
    };
  }

  private formatLabels(
    method: string,
    route: string,
    status: number,
  ): string {
    const sanitizedRoute = route.replace(/"/g, '').replace(/\s+/g, '');
    return `{method="${method}",route="${sanitizedRoute}",status="${status}"}`;
  }
}
