import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Request } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request & { route?: { path?: string } }>();
    const response = context.switchToHttp().getResponse<{ statusCode?: number }>();

    const route = this.resolveRoute(request);
    if (route.startsWith('/metrics')) {
      return next.handle();
    }

    const method = request.method ?? 'UNKNOWN';
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      finalize(() => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000;
        const status = response.statusCode ?? 0;

        this.metricsService.recordRequest(method, route, status, durationMs);
      }),
    );
  }

  private resolveRoute(request: any): string {
    return (
      request.route?.path ??
      request.baseUrl ??
      request.path ??
      request.url ??
      'unknown'
    );
  }
}
