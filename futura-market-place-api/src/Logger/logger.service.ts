/**
 * Logger Service
 * Wrapper around Winston logger for structured logging
 */

import {
  Injectable,
  Inject,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  /**
   * Log info level message
   */
  log(message: string, context?: string, metadata?: Record<string, any>): void {
    this.logger.info(message, { context, ...metadata });
  }

  /**
   * Log error level message
   */
  error(
    message: string,
    trace?: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.error(message, { context, trace, ...metadata });
  }

  /**
   * Log warning level message
   */
  warn(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.warn(message, { context, ...metadata });
  }

  /**
   * Log debug level message
   */
  debug(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.debug(message, { context, ...metadata });
  }

  /**
   * Log verbose level message
   */
  verbose(
    message: string,
    context?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.verbose(message, { context, ...metadata });
  }

  /**
   * Log API request
   */
  logRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    userId?: string,
  ): void {
    this.logger.info('HTTP Request', {
      context: 'HTTPRequest',
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      userId,
    });
  }

  /**
   * Log database query
   */
  logQuery(
    operation: string,
    collection: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    this.logger.debug('Database Query', {
      context: 'DatabaseQuery',
      operation,
      collection,
      duration: `${duration}ms`,
      ...metadata,
    });
  }

  /**
   * Log external API call
   */
  logExternalCall(
    service: string,
    endpoint: string,
    statusCode: number,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    this.logger.info('External API Call', {
      context: 'ExternalAPI',
      service,
      endpoint,
      statusCode,
      duration: `${duration}ms`,
      ...metadata,
    });
  }

  /**
   * Log authentication event
   */
  logAuth(
    event: 'login' | 'logout' | 'register' | 'token_refresh' | 'failed_login',
    userId?: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.info(`Authentication: ${event}`, {
      context: 'Authentication',
      event,
      userId,
      ...metadata,
    });
  }

  /**
   * Log business event (order created, payment processed, etc.)
   */
  logBusinessEvent(
    event: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>,
  ): void {
    this.logger.info(`Business Event: ${event}`, {
      context: 'BusinessEvent',
      event,
      entityType,
      entityId,
      ...metadata,
    });
  }

  /**
   * Log security event
   */
  logSecurity(
    event: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    metadata?: Record<string, any>,
  ): void {
    const logLevel =
      severity === 'critical' || severity === 'high' ? 'error' : 'warn';

    this.logger[logLevel](`Security Event: ${event}`, {
      context: 'Security',
      event,
      severity,
      ...metadata,
    });
  }

  /**
   * Log performance metric
   */
  logPerformance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';

    this.logger[level](`Performance: ${operation}`, {
      context: 'Performance',
      operation,
      duration: `${duration}ms`,
      ...metadata,
    });
  }
}
