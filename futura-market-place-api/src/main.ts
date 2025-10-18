// New Relic APM - MUST be first import!
// Only load in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_NEW_RELIC === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('newrelic');
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setupSwagger, getSwaggerConfigForEnvironment } from './config/swagger.config';
import { initializeSentry } from './config/sentry.config';
import * as express from 'express';

// LOGGER
import { LoggerService } from './Logger/logger.service';
import { HttpLoggerInterceptor } from './Logger/http-logger.interceptor';

// MONITORING
import { SentryInterceptor } from './Monitoring/sentry.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize Sentry early
  const configService = app.get(ConfigService);
  initializeSentry(configService);

  // Raw body parsing for Stripe webhooks
  // Stripe requires the raw body to verify webhook signatures
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

  // Setup Winston logger as the application logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Get logger service instance for use in bootstrap
  const logger = app.get(LoggerService);
  logger.log('🚀 Application starting...', 'Bootstrap');

  // SECURITY FIX (HIGH-4): Configure Helmet.js for security headers
  // Helmet helps secure Express apps by setting HTTP headers
  // Note: Configured to work with Stripe webhooks and Sentry
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for Swagger UI
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'], // Allow images from Azure Blob Storage
          connectSrc: ["'self'", 'https://api.stripe.com', 'https://*.sentry.io'], // Allow Stripe and Sentry
          fontSrc: ["'self'", 'data:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // Disabled to allow Swagger UI and Stripe to work
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    }),
  );
  logger.log('🔒 Security headers configured with Helmet.js', 'Bootstrap');

  // CORS Configuration
  // Reads allowed origins from environment variable CORS_ORIGINS
  // Format: comma-separated list of URLs (e.g., "http://localhost:3001,http://localhost:3003")
  // Falls back to default localhost origins if not configured
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3003'
      ];

  // Security warning for production
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGINS) {
    logger.error(
      '⚠️  SECURITY WARNING: CORS_ORIGINS not configured in production! Using localhost fallback.',
      'Bootstrap'
    );
    logger.error(
      '⚠️  Set CORS_ORIGINS environment variable with allowed production origins.',
      'Bootstrap'
    );
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Setup global interceptors
  app.useGlobalInterceptors(
    new HttpLoggerInterceptor(logger),
    new SentryInterceptor()
  );

  // Enable global validation with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Strip properties not in DTO
      transform: true,        // Transform payloads to DTO instances
      forbidNonWhitelisted: false, // Don't throw error for extra properties (for backward compatibility)
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types (string to number, etc)
      },
    }),
  );

  // Setup Swagger documentation (disabled in production by default)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    const swaggerConfig = getSwaggerConfigForEnvironment();
    setupSwagger(app, swaggerConfig);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(
    `✅ Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  logger.log(
    `📚 Swagger documentation: http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}
bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
