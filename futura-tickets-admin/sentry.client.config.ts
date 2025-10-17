import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,

  // Adjust sample rate for production traffic
  tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

  // Session Replay (replaysSessionSampleRate and replaysOnErrorSampleRate are automatically handled)

  // Integrations are automatically included in newer versions
  integrations: [],

  // Trace propagation targets
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/api\.futuratickets\.com/,
    /^https:\/\/api-staging\.futuratickets\.com/,
  ],

  // Filter out sensitive information
  beforeSend(event, hint) {
    // Remove localStorage/sessionStorage data
    if (event.contexts?.state) {
      delete event.contexts.state;
    }

    // Filter sensitive cookies
    if (event.request?.cookies) {
      const filteredCookies: Record<string, string> = {};
      Object.keys(event.request.cookies).forEach((key) => {
        if (!key.toLowerCase().includes('token') && !key.toLowerCase().includes('session')) {
          filteredCookies[key] = event.request!.cookies![key];
        }
      });
      event.request.cookies = filteredCookies;
    }

    // Filter sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    // Filter sensitive query params
    if (event.request?.query_string) {
      const params = new URLSearchParams(event.request.query_string);
      if (params.has('token')) {
        params.delete('token');
      }
      if (params.has('apiKey')) {
        params.delete('apiKey');
      }
      event.request.query_string = params.toString();
    }

    // Don't send expected errors
    const error = hint.originalException;
    if (error instanceof Error) {
      // Skip 404 errors
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return null;
      }
      // Skip network errors
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        return null;
      }
    }

    return event;
  },

  // Ignore common browser extension errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'originalCreateNotification',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'Can\'t find variable: ZiteReader',
    'jigsaw is not defined',
    'ComboSearch is not defined',

    // Network errors
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    'Load failed',

    // Browser specific
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',

    // Third-party scripts
    'Script error.',
  ],

  // Filter noisy breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Don't track console.log in production
    if (breadcrumb.category === 'console' && ENVIRONMENT === 'production') {
      return null;
    }

    // Filter UI events that are too noisy
    if (breadcrumb.category === 'ui.click') {
      // Only track clicks on important elements
      const target = breadcrumb.message || '';
      if (!target.includes('button') && !target.includes('link')) {
        return null;
      }
    }

    return breadcrumb;
  },

  // Set user context
  initialScope: {
    tags: {
      app: 'admin-panel',
    },
  },
});

// Export for use in error boundaries
export { Sentry };
