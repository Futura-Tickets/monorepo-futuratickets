// New Relic APM - MUST be first import!
// Only load in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_NEW_RELIC === 'true') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('newrelic');
}

// Sentry Error Tracking - TEMPORARILY DISABLED due to API breaking changes in v10.20.0
// TODO: Migrate to new Sentry API when time permits
// import { initializeSentry } from './config/sentry.config';
// initializeSentry();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

// MODULES
import { AppModule } from './app.module';

// SWAGGER
import { setupSwagger, getSwaggerConfigForEnvironment } from './config/swagger.config';

// ENV VALIDATION
import { validateEnv } from './config/env.validation';

// LOGGER
import { LoggerService } from './Logger/logger.service';
import { HttpLoggerInterceptor } from './Logger/http-logger.interceptor';

// FILTERS
// TEMPORARILY DISABLED: Sentry has breaking changes in v10.20.0
// import { SentryExceptionFilter } from './common/filters/sentry-exception.filter';

async function bootstrap() {
  // Validate environment variables before starting the app
  // Note: Validation is currently in warning mode. Set strict validation in production
  try {
    validateEnv();
  } catch (error) {
    console.warn('⚠️  Environment validation failed, but continuing in development mode');
    console.warn('   Please configure all required environment variables for production');
  }
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Setup Winston logger as the application logger
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Get logger service instance for use in bootstrap
  const logger = app.get(LoggerService);
  logger.log('🚀 Application starting...', 'Bootstrap');

  // Setup HTTP logging interceptor
  // @ts-expect-error - RxJS type mismatch in monorepo structure
  app.useGlobalInterceptors(new HttpLoggerInterceptor(logger));

  // Setup global exception filter (Sentry integration)
  // TEMPORARILY DISABLED: Sentry breaking changes in v10.20.0
  // app.useGlobalFilters(new SentryExceptionFilter());

  // CORS Configuration
  // Reads allowed origins from environment variable CORS_ORIGINS
  // Format: comma-separated list of URLs (e.g., "http://localhost:3001,http://localhost:3002")
  // Falls back to default localhost origins if not configured
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost:3006'];

  // Production CORS warning
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGINS) {
    logger.error('⚠️  SECURITY WARNING: CORS_ORIGINS not configured in production!', 'Bootstrap');
    logger.error('⚠️  Set CORS_ORIGINS environment variable with allowed production origins.', 'Bootstrap');
    logger.error('⚠️  Example: CORS_ORIGINS=https://admin.futuratickets.com,https://futuratickets.com', 'Bootstrap');
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  logger.log(`🔒 CORS enabled for origins: ${corsOrigins.join(', ')}`, 'Bootstrap');

  // Enable global validation with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      transform: true, // Transform payloads to DTO instances
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

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`✅ Application is running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
