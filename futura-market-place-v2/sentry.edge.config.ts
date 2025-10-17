import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,

  // Adjust sample rate for production traffic
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Filter out sensitive information
  beforeSend(event) {
    // Remove environment variables
    if (event.contexts?.runtime?.env) {
      delete event.contexts.runtime.env;
    }

    // Filter sensitive request data
    if (event.request) {
      delete event.request.cookies;

      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
    }

    return event;
  },

  // Set context
  initialScope: {
    tags: {
      app: 'marketplace',
      runtime: 'edge',
    },
  },
});
