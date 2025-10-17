import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Swagger/OpenAPI Configuration for Admin API
 *
 * This module configures Swagger documentation for the FuturaTickets Admin API.
 *
 * Features:
 * - JWT Bearer authentication scheme
 * - API versioning support
 * - Comprehensive metadata
 * - Multiple tags for organizing endpoints
 * - JSON export for CI/CD integration
 */

export interface SwaggerConfig {
  title?: string;
  description?: string;
  version?: string;
  path?: string;
  contactName?: string;
  contactEmail?: string;
  contactUrl?: string;
  license?: string;
  licenseUrl?: string;
  servers?: Array<{ url: string; description: string }>;
  exportJson?: boolean;
  exportPath?: string;
}

const defaultConfig: SwaggerConfig = {
  title: 'FuturaTickets Admin API',
  description: `
## FuturaTickets Admin API Documentation

This API provides comprehensive endpoints for managing events, tickets, orders, and users in the FuturaTickets platform.

### Getting Started

1. **Authentication**: Most endpoints require a JWT Bearer token. Obtain a token by logging in via \`/auth/login\`.
2. **Authorization**: Click the "Authorize" button above and enter your Bearer token.
3. **Roles**: Different endpoints require different roles (ADMIN, PROMOTER, USER).

### API Features

- Event Management (CRUD operations)
- Order Processing & Payment Integration
- Ticket Sales & Validation
- User & Account Management
- Promoter Management
- Email Notifications
- WebSocket Support for Real-time Updates

### Rate Limits

| Endpoint Type | Requests per Minute |
|--------------|---------------------|
| Authentication | 10 |
| Read Operations | 100 |
| Write Operations | 50 |

### Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
  `,
  version: '1.0.0',
  path: 'api/docs',
  contactName: 'FuturaTickets Support',
  contactEmail: 'support@futuratickets.com',
  contactUrl: 'https://futuratickets.com/support',
  license: 'MIT',
  licenseUrl: 'https://opensource.org/licenses/MIT',
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development (direct)',
    },
    {
      url: 'http://localhost:3004',
      description: 'Local Development (Docker Compose)',
    },
    {
      url: 'https://admin-api-staging.futuratickets.com',
      description: 'Staging Environment',
    },
    {
      url: 'https://admin-api.futuratickets.com',
      description: 'Production Environment',
    },
  ],
  exportJson: process.env.NODE_ENV !== 'production',
  exportPath: './swagger-spec.json',
};

export function setupSwagger(
  app: INestApplication,
  config: Partial<SwaggerConfig> = {},
): void {
  const finalConfig: Required<SwaggerConfig> = {
    ...defaultConfig,
    ...config,
    title: config.title ?? defaultConfig.title ?? 'FuturaTickets Admin API',
    description:
      config.description ?? defaultConfig.description ?? 'API Documentation',
    version: config.version ?? defaultConfig.version ?? '1.0.0',
    path: config.path ?? defaultConfig.path ?? 'api/docs',
    contactName: config.contactName ?? defaultConfig.contactName ?? 'Support',
    contactEmail:
      config.contactEmail ??
      defaultConfig.contactEmail ??
      'support@futuratickets.com',
    contactUrl:
      config.contactUrl ??
      defaultConfig.contactUrl ??
      'https://futuratickets.com',
    license: config.license ?? defaultConfig.license ?? 'MIT',
    licenseUrl:
      config.licenseUrl ??
      defaultConfig.licenseUrl ??
      'https://opensource.org/licenses/MIT',
    servers: config.servers ?? defaultConfig.servers ?? [],
    exportJson: config.exportJson ?? defaultConfig.exportJson ?? false,
    exportPath:
      config.exportPath ?? defaultConfig.exportPath ?? './swagger-spec.json',
  };

  const documentConfig = new DocumentBuilder()
    .setTitle(finalConfig.title)
    .setDescription(finalConfig.description)
    .setVersion(finalConfig.version)
    .setContact(
      finalConfig.contactName,
      finalConfig.contactUrl,
      finalConfig.contactEmail,
    )
    .setLicense(finalConfig.license, finalConfig.licenseUrl)
    .setExternalDoc('API Changelog', 'https://docs.futuratickets.com/changelog')
    .setTermsOfService('https://futuratickets.com/terms');

  // Add servers
  finalConfig.servers.forEach((server) => {
    documentConfig.addServer(server.url, server.description);
  });

  // Add JWT Bearer authentication scheme
  documentConfig.addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter your JWT token obtained from the login endpoint',
      in: 'header',
    },
    'JWT-auth',
  );

  // Define API tags for organizing endpoints
  documentConfig
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Accounts', 'User account management')
    .addTag('Events', 'Event creation, management, and listings')
    .addTag('Orders', 'Order management and tracking')
    .addTag('Payments', 'Payment processing and transactions')
    .addTag('Tickets', 'Ticket operations and validation')
    .addTag('Sales', 'Sales tracking and analytics')
    .addTag('Promoters', 'Promoter management')
    .addTag('Notifications', 'Push notifications and email management')
    .addTag('Stripe', 'Stripe payment integration')
    .addTag('Health', 'Health check and monitoring endpoints');

  // Create OpenAPI document
  const document = SwaggerModule.createDocument(app, documentConfig.build(), {
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return `${controllerKey}_${methodKey}`;
    },
  });

  // Customize Swagger UI
  const swaggerUiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: 3,
      defaultModelExpandDepth: 3,
      deepLinking: true,
      displayOperationId: false,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #3b82f6 }
      .swagger-ui .info .description { font-size: 14px; line-height: 1.6 }
      .swagger-ui .scheme-container { background: #f9fafb; padding: 15px; border-radius: 8px }
      .swagger-ui .opblock-tag { font-size: 16px; font-weight: 600 }
      .swagger-ui .opblock { border-radius: 8px; margin-bottom: 10px }
      .swagger-ui .opblock.opblock-post { border-color: #10b981; background: rgba(16, 185, 129, 0.05) }
      .swagger-ui .opblock.opblock-get { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05) }
      .swagger-ui .opblock.opblock-put { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05) }
      .swagger-ui .opblock.opblock-delete { border-color: #ef4444; background: rgba(239, 68, 68, 0.05) }
    `,
    customSiteTitle: `${finalConfig.title} - API Documentation`,
    customfavIcon: '/favicon.ico',
  };

  // Setup Swagger module
  SwaggerModule.setup(finalConfig.path, app, document, swaggerUiOptions);

  // Export OpenAPI JSON specification
  if (finalConfig.exportJson) {
    try {
      const outputPath = join(process.cwd(), finalConfig.exportPath);
      writeFileSync(outputPath, JSON.stringify(document, null, 2), {
        encoding: 'utf8',
      });
      console.log(`✅ OpenAPI specification exported to: ${outputPath}`);
    } catch (error) {
      console.error('❌ Failed to export OpenAPI specification:', error);
    }
  }

  console.log(
    `📚 Swagger documentation available at: http://localhost:${
      process.env.PORT || 3000
    }/${finalConfig.path}`,
  );
}

export function getSwaggerConfigForEnvironment(): Partial<SwaggerConfig> {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return {
        servers: [
          {
            url: 'https://admin-api.futuratickets.com',
            description: 'Production',
          },
        ],
        exportJson: false,
      };

    case 'staging':
      return {
        servers: [
          {
            url: 'https://admin-api-staging.futuratickets.com',
            description: 'Staging',
          },
        ],
        exportJson: true,
      };

    case 'development':
    default:
      return {
        servers: [
          {
            url: `http://localhost:${process.env.PORT || 3000}`,
            description: 'Local Development',
          },
        ],
        exportJson: true,
      };
  }
}
