import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Swagger/OpenAPI Configuration for Access Control API
 *
 * This module configures Swagger documentation for the FuturaTickets Access Control API.
 *
 * Features:
 * - JWT Bearer authentication scheme
 * - Ticket validation and check-in
 * - Real-time access notifications
 * - Promoter and access personnel management
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
  title: 'FuturaTickets Access Control API',
  description: `
## FuturaTickets Access Control API Documentation

This API manages ticket validation, access control, and check-in operations for events.

### Getting Started

1. **Authentication**: Endpoints require JWT Bearer token for ACCESS role users.
2. **Authorization**: Click the "Authorize" button above and enter your Bearer token.
3. **Roles**:
   - ACCESS: Venue access control personnel
   - PROMOTER: Event organizers
   - ADMIN: System administrators

### API Features

- **Ticket Validation**: Scan and validate QR codes
- **Check-in Management**: Track attendee entry
- **Access Control**: Grant or deny venue access
- **Real-time Notifications**: WebSocket updates for live monitoring
- **Attendee Lists**: View all attendees for an event
- **Promo Codes**: Manage promotional codes and invitations
- **Access Logs**: Complete audit trail of all access attempts

### Access Validation Flow

1. ACCESS personnel scans ticket QR code
2. System validates ticket status (OPEN, CLOSED, EXPIRED, etc.)
3. System checks event assignment matches personnel
4. Access granted or denied based on validation
5. Ticket status updated (OPEN → CLOSED)
6. Real-time notification sent to promoter
7. Access history logged

### Ticket Statuses

- **OPEN**: Valid ticket, ready for check-in
- **CLOSED**: Already used (check-in completed)
- **SALE**: Ticket listed for resale
- **EXPIRED**: Event date passed
- **TRANSFERED**: Ownership transferred

### Rate Limits

| Endpoint Type | Requests per Minute |
|--------------|---------------------|
| Authentication | 10 |
| Validation | 200 |
| Read Operations | 100 |

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
      url: 'https://access-api-staging.futuratickets.com',
      description: 'Staging Environment',
    },
    {
      url: 'https://access-api.futuratickets.com',
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
  } as Required<SwaggerConfig>;

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
  if (finalConfig.servers) {
    finalConfig.servers.forEach((server) => {
      documentConfig.addServer(server.url, server.description);
    });
  }

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
    .addTag('Authentication', 'Login and token validation for access personnel')
    .addTag('Access Control', 'Ticket validation and check-in operations')
    .addTag('Events', 'Event information and attendee management')
    .addTag('Promo Codes', 'Promotional code management')
    .addTag('Accounts', 'Access personnel account management')
    .addTag('Notifications', 'Real-time access notifications')
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
      .swagger-ui .opblock.opblock-patch { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.05) }
    `,
    customSiteTitle: `${finalConfig.title} - API Documentation`,
    customfavIcon: '/favicon.ico',
  };

  // Setup Swagger module
  SwaggerModule.setup(finalConfig.path, app, document, swaggerUiOptions);

  // Export OpenAPI JSON specification
  if (finalConfig.exportJson && finalConfig.exportPath) {
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
            url: 'https://access-api.futuratickets.com',
            description: 'Production',
          },
        ],
        exportJson: false,
      };

    case 'staging':
      return {
        servers: [
          {
            url: 'https://access-api-staging.futuratickets.com',
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
