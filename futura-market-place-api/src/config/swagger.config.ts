import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Swagger/OpenAPI Configuration for Marketplace API
 *
 * This module configures Swagger documentation for the FuturaTickets Marketplace API.
 *
 * Features:
 * - JWT Bearer authentication scheme
 * - Stripe payment integration
 * - Order processing and management
 * - Real-time WebSocket notifications
 * - Email notifications
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
  title: 'FuturaTickets Marketplace API',
  description: `
## FuturaTickets Marketplace API Documentation

This API handles the marketplace operations including order processing, payments, and ticket management.

### Getting Started

1. **Authentication**: Most endpoints require a JWT Bearer token. Obtain a token by logging in.
2. **Authorization**: Click the "Authorize" button above and enter your Bearer token.
3. **Payment Integration**: Uses Stripe for secure payment processing.

### API Features

- **Order Management**: Create and track orders
- **Payment Processing**: Stripe integration for secure payments
- **Ticket Sales**: Primary and secondary market sales
- **Email Notifications**: Automated transactional emails
- **WebSocket Support**: Real-time order updates
- **Ticket Transfers**: Transfer tickets between users
- **Resale Management**: Secondary market functionality

### Payment Flow

1. Client requests Stripe configuration
2. Create payment intent with order details
3. Client completes payment with Stripe
4. Webhook confirms payment
5. System processes order and creates tickets
6. Email confirmation sent to customer

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
      description: 'Local Development',
    },
    {
      url: 'https://marketplace-api-staging.futuratickets.com',
      description: 'Staging Environment',
    },
    {
      url: 'https://marketplace-api.futuratickets.com',
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
  const finalConfig = { ...defaultConfig, ...config };

  const documentConfig = new DocumentBuilder()
    .setTitle(finalConfig.title || 'FuturaTickets Marketplace API')
    .setDescription(finalConfig.description || 'Marketplace API Documentation')
    .setVersion(finalConfig.version || '1.0.0')
    .setContact(
      finalConfig.contactName || 'FuturaTickets Support',
      finalConfig.contactUrl || 'https://futuratickets.com/support',
      finalConfig.contactEmail || 'support@futuratickets.com',
    )
    .setLicense(finalConfig.license || 'MIT', finalConfig.licenseUrl || 'https://opensource.org/licenses/MIT')
    .setExternalDoc('API Changelog', 'https://docs.futuratickets.com/changelog')
    .setTermsOfService('https://futuratickets.com/terms');

  // Add servers
  finalConfig.servers?.forEach((server) => {
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
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Orders', 'Order creation and management')
    .addTag('Payments', 'Payment processing with Stripe')
    .addTag('Stripe', 'Stripe integration endpoints')
    .addTag('Sales', 'Ticket sales and transfers')
    .addTag('Events', 'Event information')
    .addTag('Accounts', 'User account management')
    .addTag('Notifications', 'Email and push notifications')
    .addTag('Health', 'Health check endpoints');

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
  SwaggerModule.setup(finalConfig.path || 'api/docs', app, document, swaggerUiOptions);

  // Export OpenAPI JSON specification
  if (finalConfig.exportJson) {
    try {
      const outputPath = join(process.cwd(), finalConfig.exportPath || './swagger-spec.json');
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
            url: 'https://marketplace-api.futuratickets.com',
            description: 'Production',
          },
        ],
        exportJson: false,
      };

    case 'staging':
      return {
        servers: [
          {
            url: 'https://marketplace-api-staging.futuratickets.com',
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
