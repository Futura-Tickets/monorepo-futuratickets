/**
 * New Relic agent configuration for Marketplace API
 */
exports.config = {
  /**
   * Application name(s) as they will appear in New Relic
   */
  app_name: ['FuturaTickets-Marketplace-API'],

  /**
   * Your New Relic license key
   * IMPORTANT: Add NEW_RELIC_LICENSE_KEY to your .env file
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY || '',

  /**
   * Logging configuration
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
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.x-api-key',
      'request.headers.stripe-signature',
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
        'Payment Required',
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
   * Browser monitoring
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
      value: 'marketplace-api',
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
    service: 'marketplace-api',
  },
};
