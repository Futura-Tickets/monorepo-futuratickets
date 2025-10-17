import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError((error) => {
                // Get request context
                const request = context.switchToHttp().getRequest();
                const user = request.user;

                // Set user context if available
                if (user) {
                    Sentry.setUser({
                        id: user.id || user._id,
                        email: user.email,
                        username: user.name
                    });
                }

                // Set additional context
                Sentry.setContext('request', {
                    method: request.method,
                    url: request.url,
                    headers: {
                        ...request.headers,
                        // Remove sensitive headers
                        authorization: undefined,
                        cookie: undefined,
                    },
                    query: request.query,
                    body: this.sanitizeBody(request.body),
                });

                // Determine severity
                let level: Sentry.SeverityLevel = 'error';
                if (error instanceof HttpException) {
                    const status = error.getStatus();
                    if (status >= 500) {
                        level = 'error';
                    } else if (status >= 400) {
                        level = 'warning';
                    }
                } else {
                    level = 'fatal';
                }

                // Capture exception in Sentry
                Sentry.captureException(error, {
                    level,
                    tags: {
                        path: request.url,
                        method: request.method,
                    },
                });

                // Re-throw the error
                return throwError(() => error);
            }),
        );
    }

    private sanitizeBody(body: any): any {
        if (!body) return body;

        // Create a copy to avoid modifying original
        const sanitized = { ...body };

        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard'];
        for (const field of sensitiveFields) {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        }

        return sanitized;
    }
}
