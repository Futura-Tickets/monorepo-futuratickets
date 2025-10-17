import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { ConfigService } from '@nestjs/config';

export function initializeSentry(configService: ConfigService): void {
    const sentryDsn = configService.get<string>('SENTRY_DSN');
    const environment = configService.get<string>('NODE_ENV') || 'development';
    const release = configService.get<string>('npm_package_version') || '0.0.1';

    // Only initialize if DSN is provided
    if (!sentryDsn) {
        console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: sentryDsn,
        environment,
        release: `futura-marketplace-api@${release}`,

        // Performance Monitoring
        tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
        
        // Profiling
        profilesSampleRate: environment === 'production' ? 0.1 : 1.0,
        integrations: [
            nodeProfilingIntegration(),
        ],

        // Before sending events to Sentry
        beforeSend(event, hint) {
            // Filter out sensitive data
            if (event.request) {
                // Remove authorization headers
                if (event.request.headers) {
                    delete event.request.headers['authorization'];
                    delete event.request.headers['cookie'];
                }

                // Remove sensitive query params
                if (event.request.query_string) {
                    const queryString = typeof event.request.query_string === 'string'
                        ? event.request.query_string
                        : JSON.stringify(event.request.query_string);

                    const sensitiveParams = ['token', 'password', 'secret', 'apiKey'];
                    let redactedQuery = queryString;
                    for (const param of sensitiveParams) {
                        if (redactedQuery.includes(param)) {
                            redactedQuery = redactedQuery.replace(
                                new RegExp(`${param}=[^&]*`, 'gi'),
                                `${param}=[REDACTED]`
                            );
                        }
                    }
                    event.request.query_string = redactedQuery;
                }
            }

            return event;
        },

        // Ignore specific errors
        ignoreErrors: [
            // Ignore known bot errors
            'ResizeObserver loop limit exceeded',
            'Non-Error promise rejection captured',
            
            // Ignore network errors that are not actionable
            'Network request failed',
            'Failed to fetch',
        ],
    });

    console.log(`✅ Sentry initialized for environment: ${environment}`);
}

// Note: Sentry v10+ for NestJS uses interceptors instead of Express middleware
// The handlers below are not used and commented out for TypeScript compilation
// If needed, implement using @sentry/nestjs interceptors instead

// // Error handler middleware (deprecated in Sentry v10+)
// export function sentryErrorHandler() {
//     return Sentry.Handlers.errorHandler({
//         shouldHandleError(error) {
//             // Capture all 5xx errors
//             if (error.status && error.status >= 500) {
//                 return true;
//             }
//             // Capture specific error types
//             if (error instanceof TypeError || error instanceof ReferenceError) {
//                 return true;
//             }
//             return false;
//         },
//     });
// }

// // Request handler middleware (deprecated in Sentry v10+)
// export function sentryRequestHandler() {
//     return Sentry.Handlers.requestHandler();
// }

// // Tracing handler (deprecated in Sentry v10+)
// export function sentryTracingHandler() {
//     return Sentry.Handlers.tracingHandler();
// }
