/**
 * Winston Logger Configuration
 * Structured logging with different levels and transports
 */

import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for console output (readable)
const consoleFormat = printf(({ level, message, timestamp, context, trace, ...metadata }) => {
  let msg = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;

  // Add metadata if exists
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }

  // Add stack trace if exists
  if (trace) {
    msg += `\n${trace}`;
  }

  return msg;
});

// Custom format for file output (JSON)
const fileFormat = combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), json());

// Log levels based on environment
const getLogLevel = (): string => {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return 'info';
    case 'staging':
      return 'debug';
    default:
      return 'debug';
  }
};

// Create logs directory path
const logsDir = path.join(process.cwd(), 'logs');

export const winstonConfig: WinstonModuleOptions = {
  level: getLogLevel(),
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true })),
  transports: [
    // Console transport (for development)
    new winston.transports.Console({
      format: combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), consoleFormat),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File transport for warnings
    new winston.transports.File({
      filename: path.join(logsDir, 'warnings.log'),
      level: 'warn',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
};

// Export logger instance for use in bootstrap
export const createLogger = () => winston.createLogger(winstonConfig);
