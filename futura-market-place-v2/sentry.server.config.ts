import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,

  // Adjust sample rate for production traffic
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Integrations
  integrations: [
    Sentry.httpIntegration({ tracing: true }),
  ],

  // Filter out sensitive information
  beforeSend(event, hint) {
    // Remove environment variables
    if (event.contexts?.runtime?.env) {
      delete event.contexts.runtime.env;
    }

    // Filter sensitive request data
    if (event.request) {
      // Remove cookies
      delete event.request.cookies;

      // Remove authorization headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // Filter query parameters
      if (event.request.query_string) {
        const params = new URLSearchParams(event.request.query_string);
        if (params.has('token')) {
          params.delete('token');
        }
        if (params.has('apiKey')) {
          params.delete('apiKey');
        }
        if (params.has('paymentIntentId')) {
          params.delete('paymentIntentId');
        }
        event.request.query_string = params.toString();
      }
    }

    // Don't send expected errors
    const error = hint.originalException;
    if (error instanceof Error) {
      // Skip 404 errors
      if (error.message.includes('NotFound') || error.message.includes('404')) {
        return null;
      }
      // Skip validation errors
      if (error.message.includes('ValidationError')) {
        return null;
      }
    }

    return event;
  },

  // Ignore common errors
  ignoreErrors: [
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'NetworkError',
    'AbortError',
  ],

  // Set context
  initialScope: {
    tags: {
      app: 'marketplace',
      runtime: 'node',
    },
  },
});
