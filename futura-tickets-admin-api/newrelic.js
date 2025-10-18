/**
 * New Relic agent configuration for Admin API
 */
exports.config = {
  /**
   * Application name(s) as they will appear in New Relic
   * You can have multiple app names for a single application
   */
  app_name: ['FuturaTickets-Admin-API'],

  /**
   * Your New Relic license key
   * IMPORTANT: Add NEW_RELIC_LICENSE_KEY to your .env file
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',

  /**
   * Logging configuration
   * 'info' is good for production, 'trace' for debugging
   */
  logging: {
    level: process.env.NEW_RELIC_LOG_LEVEL || 'info',
    filepath: 'logs/newrelic_agent.log',
  },

  /**
   * When true, all request headers will be captured for all traces
   */
  allow_all_headers: true,

  /**
   * Attributes configuration
   */
  attributes: {
    /**
     * Attributes to include/exclude from all destinations
     */
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.x-api-key',
    ],
  },

  /**
   * Transaction tracer configuration
   */
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    explainThreshold: 500,
  },

  /**
   * Error collector configuration
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [404],
    expected_messages: {
      'HttpException': [
        'Bad Request',
        'Unauthorized',
        'Forbidden',
      ]
    },
  },

  /**
   * Distributed tracing
   */
  distributed_tracing: {
    enabled: true,
  },

  /**
   * Custom instrumentation
   */
  custom_insights_events: {
    enabled: true,
  },

  /**
   * Application logging
   */
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
    metrics: {
      enabled: true,
    },
    local_decorating: {
      enabled: false,
    },
  },

  /**
   * Browser monitoring (for server-side rendered pages)
   */
  browser_monitoring: {
    enable: false,
  },

  /**
   * Custom attributes for all transactions
   */
  custom_parameters: [
    {
      name: 'environment',
      value: process.env.NODE_ENV || 'development',
    },
    {
      name: 'service',
      value: 'admin-api',
    },
  ],

  /**
   * Slow SQL query tracer
   */
  slow_sql: {
    enabled: true,
  },

  /**
   * MongoDB instrumentation
   */
  datastore_tracer: {
    database_name_reporting: {
      enabled: true,
    },
    instance_reporting: {
      enabled: true,
    },
  },

  /**
   * Labels for better organization in New Relic
   */
  labels: {
    environment: process.env.NODE_ENV || 'development',
    team: 'futuratickets',
    service: 'admin-api',
  },
};
