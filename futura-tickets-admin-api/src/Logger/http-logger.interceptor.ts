/**
 * HTTP Logger Interceptor
 * Automatically logs all HTTP requests with timing information
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class HttpLoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const startTime = Date.now();

    // Extract user ID from request if available
    const userId = request.user?.id || request.user?._id;

    // Type assertion to handle RxJS version mismatch in monorepo
    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          this.logger.logRequest(method, url, statusCode, duration, userId);

          // Log slow requests as warnings
          if (duration > 3000) {
            this.logger.warn(`Slow request detected: ${method} ${url}`, 'HttpLoggerInterceptor', { duration, userId });
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          this.logger.error(`Request failed: ${method} ${url}`, error.stack, 'HttpLoggerInterceptor', {
            statusCode,
            duration,
            userId,
            errorMessage: error.message,
          });
        },
      }),
    ) as Observable<any>;
  }
}
