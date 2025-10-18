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

  // @ts-expect-error - RxJS version mismatch in monorepo (local vs root node_modules)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;
    const startTime = Date.now();

    // Extract user ID from request if available
    const userId = request.user?.id || request.user?._id;

    // Type assertion to handle RxJS version mismatch in monorepo
    return (
      next
        .handle()
        // @ts-expect-error - RxJS Observable type from different package location
        .pipe(
          tap({
            next: () => {
              const duration = Date.now() - startTime;
              const { statusCode } = response;

              this.logger.logRequest(method, url, statusCode, duration, userId);

              // Log slow requests as warnings
              if (duration > 3000) {
                this.logger.warn(`Slow request detected: ${method} ${url}`, 'HttpLoggerInterceptor', {
                  duration,
                  userId,
                });
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
        ) as unknown as Observable<any>
    );
  }
}
