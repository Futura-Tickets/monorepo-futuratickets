import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

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
 * npm install @nestjs/terminus @nestjs/axios
 *
 * Usage:
 * 1. Import this controller in your main app module
 * 2. Ensure Mongoose is properly configured
 *
 * Endpoints:
 * - GET /health: Basic health check (liveness probe)
 * - GET /health/ready: Comprehensive readiness check
 * - GET /health/info: System information
 */

@Controller('health')
export class HealthCheckController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
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
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      service: 'futura-access-api',
    };
  }

  /**
   * Readiness Check
   *
   * This endpoint performs comprehensive checks of all critical dependencies
   * including database, memory, and disk space.
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
  async checkReadiness() {
    return this.health.check([
      // Check MongoDB connection
      // Performs a simple query to ensure DB is responsive
      () => this.db.pingCheck('database', { timeout: 3000 }),

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
  async getSystemInfo() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: new Date().toISOString(),
      application: {
        name: 'FuturaTickets Access API',
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
    };
  }
}

/**
 * INTEGRATION GUIDE
 *
 * 1. Install dependencies:
 *    npm install @nestjs/terminus @nestjs/axios
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
 *    - APP_VERSION: Application version
 *    - NODE_ENV: Environment (development, staging, production)
 */
