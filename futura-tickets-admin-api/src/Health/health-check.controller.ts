import { Controller, Get, HttpStatus } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Health Check Controller
 *
 * Provides endpoints for monitoring application health and readiness.
 * These endpoints are typically used by:
 * - Kubernetes liveness and readiness probes
 * - Load balancers
 * - Monitoring systems (Prometheus, Grafana, etc.)
 *
 * Installation:
 * npm install @nestjs/terminus @nestjs/axios ioredis
 *
 * Usage:
 * 1. Import this controller in your main app module
 * 2. Configure environment variables for Redis (REDIS_HOST, REDIS_PORT)
 * 3. Ensure Mongoose is properly configured
 *
 * Endpoints:
 * - GET /health: Basic health check (liveness probe)
 * - GET /health/ready: Comprehensive readiness check
 * - GET /health/info: System information
 */

/**
 * Redis Health Indicator
 * Custom health indicator for Redis connection
 */
@Injectable()
export class RedisHealthIndicator {
  private redis: Redis;

  constructor() {
    // Initialize Redis connection
    // Adjust configuration based on your environment
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      retryStrategy: (times) => {
        // Reconnect after 1 second
        return Math.min(times * 50, 2000);
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });
  }

  /**
   * Check Redis connection health
   * @param key - Identifier for this health check
   * @returns Health check result
   */
  async isHealthy(key: string): Promise<any> {
    try {
      // Perform a simple PING command
      const result = await this.redis.ping();

      if (result === 'PONG') {
        return {
          [key]: {
            status: 'up',
            message: 'Redis is responsive',
            responseTime: Date.now(),
          },
        };
      }

      throw new Error('Redis did not respond with PONG');
    } catch (error: any) {
      return {
        [key]: {
          status: 'down',
          message: error.message,
          error: error.stack,
        },
      };
    }
  }

  /**
   * Get Redis connection info
   */
  async getInfo(): Promise<any> {
    try {
      const info = await this.redis.info('server');
      const [, version] = info.match(/redis_version:(.+)/) || [];
      const [, uptime] = info.match(/uptime_in_seconds:(.+)/) || [];

      return {
        status: 'connected',
        version: version?.trim(),
        uptime: parseInt(uptime?.trim() || '0'),
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      };
    } catch (error: any) {
      return {
        status: 'disconnected',
        error: error.message,
      };
    }
  }

  /**
   * Cleanup on application shutdown
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private redisHealth: RedisHealthIndicator,
  ) {}

  /**
   * Basic Health Check (Liveness Probe)
   *
   * This endpoint performs a minimal health check to determine if the application
   * is running. It should respond quickly and doesn't check external dependencies.
   *
   * Use this for:
   * - Kubernetes liveness probes
   * - Simple uptime monitoring
   *
   * @returns Basic health status
   */
  @Get()
  @ApiOperation({
    summary: 'Health check (liveness)',
    description: 'Basic health check to verify the application is running. Returns service info, uptime, and version.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Application is running.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-10-14T15:30:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        version: { type: 'string', example: '1.0.0' },
        environment: { type: 'string', example: 'development' },
        service: { type: 'string', example: 'futura-tickets-admin-api' },
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      service: 'futura-tickets-admin-api',
    };
  }

  /**
   * Readiness Check
   *
   * This endpoint performs comprehensive checks of all critical dependencies
   * including database, Redis, memory, and disk space.
   *
   * Use this for:
   * - Kubernetes readiness probes
   * - Load balancer health checks
   * - Determining if the service can accept traffic
   *
   * @returns Detailed health status of all dependencies
   */
  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness check',
    description:
      'Comprehensive health check of all dependencies (MongoDB, Redis, Memory, Disk). Used by load balancers and readiness probes.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All systems operational.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: { type: 'object' },
            redis: { type: 'object' },
            memory_heap: { type: 'object' },
            memory_rss: { type: 'object' },
            disk: { type: 'object' },
          },
        },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'One or more dependencies are unhealthy.',
  })
  async checkReadiness() {
    return this.health.check([
      // Check MongoDB connection
      // Performs a simple query to ensure DB is responsive
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // Check Redis connection
      // Ensures cache layer is operational
      async () => this.redisHealth.isHealthy('redis'),

      // Check heap memory usage
      // Alert if heap usage exceeds 150MB (adjust based on your needs)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      // Check RSS (Resident Set Size) memory
      // Alert if RSS exceeds 300MB (adjust based on your needs)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Check disk space
      // Alert if available disk space is less than 50% of threshold
      // Adjust path based on your OS: '/' for Linux, 'C:\\' for Windows
      () =>
        this.disk.checkStorage('disk', {
          path: process.platform === 'win32' ? 'C:\\' : '/',
          thresholdPercent: 0.9, // Alert at 90% usage
        }),
    ]);
  }

  /**
   * System Information Endpoint
   *
   * Provides detailed information about the system state without
   * performing health checks. Useful for debugging and monitoring.
   *
   * @returns System information including memory, uptime, and connection details
   */
  @Get('info')
  @ApiOperation({
    summary: 'System information',
    description:
      'Detailed system information including memory usage, CPU, uptime, and Redis status. Does not perform health checks.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'System information retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        timestamp: { type: 'string' },
        application: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'FuturaTickets Admin API' },
            version: { type: 'string', example: '1.0.0' },
            environment: { type: 'string', example: 'development' },
            nodeVersion: { type: 'string', example: 'v20.0.0' },
            platform: { type: 'string', example: 'darwin' },
            architecture: { type: 'string', example: 'arm64' },
          },
        },
        uptime: {
          type: 'object',
          properties: {
            process: { type: 'number', example: 123 },
            system: { type: 'number', example: 456789 },
          },
        },
        memory: {
          type: 'object',
          properties: {
            rss: { type: 'string', example: '50MB' },
            heapTotal: { type: 'string', example: '25MB' },
            heapUsed: { type: 'string', example: '20MB' },
            external: { type: 'string', example: '2MB' },
            arrayBuffers: { type: 'string', example: '1MB' },
          },
        },
        cpu: {
          type: 'object',
          properties: {
            user: { type: 'number' },
            system: { type: 'number' },
          },
        },
        redis: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            version: { type: 'string', example: '8.2.2' },
            uptime: { type: 'number', example: 3600 },
            host: { type: 'string', example: 'localhost' },
            port: { type: 'number', example: 6379 },
          },
        },
      },
    },
  })
  async getSystemInfo() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: new Date().toISOString(),
      application: {
        name: 'FuturaTickets Admin API',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
      },
      uptime: {
        process: Math.floor(process.uptime()),
        system: Math.floor(require('os').uptime()),
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
        arrayBuffers: `${Math.round(memoryUsage.arrayBuffers / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      redis: await this.redisHealth.getInfo(),
    };
  }
}

/**
 * INTEGRATION GUIDE
 *
 * 1. Install dependencies:
 *    npm install @nestjs/terminus @nestjs/axios ioredis
 *
 * 2. Import in your AppModule:
 *
 *    import { Module } from '@nestjs/common';
 *    import { TerminusModule } from '@nestjs/terminus';
 *    import { HealthModule } from './Health/health.module';
 *
 *    @Module({
 *      imports: [TerminusModule, HealthModule],
 *    })
 *    export class AppModule {}
 *
 * 3. Configure Kubernetes probes (if applicable):
 *
 *    livenessProbe:
 *      httpGet:
 *        path: /health
 *        port: 3000
 *      initialDelaySeconds: 30
 *      periodSeconds: 10
 *      timeoutSeconds: 5
 *      failureThreshold: 3
 *
 *    readinessProbe:
 *      httpGet:
 *        path: /health/ready
 *        port: 3000
 *      initialDelaySeconds: 10
 *      periodSeconds: 5
 *      timeoutSeconds: 3
 *      failureThreshold: 3
 *
 * 4. Environment Variables:
 *    - REDIS_HOST: Redis server host (default: localhost)
 *    - REDIS_PORT: Redis server port (default: 6379)
 *    - REDIS_PASSWORD: Redis authentication password
 *    - APP_VERSION: Application version
 *    - NODE_ENV: Environment (development, staging, production)
 */
