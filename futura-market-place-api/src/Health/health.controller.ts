import { Controller, Get, HttpStatus, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Controller('health')
export class HealthController {

    private readonly logger = new Logger(HealthController.name);

    constructor(
        @InjectConnection() private readonly mongoConnection: Connection
    ) {}

    @Get()
    async healthCheck(@Res() res: Response): Promise<void> {
        // Simple liveness probe
        // Returns 200 if the service is running
        const healthStatus = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '0.0.1'
        };

        res.status(HttpStatus.OK).json(healthStatus);
    }

    @Get('ready')
    async readinessCheck(@Res() res: Response): Promise<void> {
        // Readiness probe - checks all dependencies
        // Returns 200 only if all critical services are available

        const checks: {
            mongodb: { status: string; message?: string };
            redis?: { status: string; message?: string };
        } = {
            mongodb: { status: 'unknown' }
        };

        let isReady = true;

        // Check MongoDB connection
        try {
            const mongoState = this.mongoConnection.readyState;
            // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
            if (mongoState === 1) {
                checks.mongodb = {
                    status: 'healthy',
                    message: 'Connected'
                };
            } else {
                checks.mongodb = {
                    status: 'unhealthy',
                    message: `Connection state: ${mongoState}`
                };
                isReady = false;
                this.logger.error('MongoDB is not ready');
            }
        } catch (error: any) {
            checks.mongodb = {
                status: 'unhealthy',
                message: error.message
            };
            isReady = false;
            this.logger.error(`MongoDB health check failed: ${error.message}`);
        }

        // TODO: Add Redis health check when Redis is being used
        // For now, Redis is optional
        /*
        try {
            // Check Redis connection if available
            const redisClient = this.redisService.getClient();
            const redisPing = await redisClient.ping();
            if (redisPing === 'PONG') {
                checks.redis = {
                    status: 'healthy',
                    message: 'Connected'
                };
            } else {
                checks.redis = {
                    status: 'unhealthy',
                    message: 'No PONG response'
                };
                isReady = false;
            }
        } catch (error: any) {
            checks.redis = {
                status: 'unhealthy',
                message: error.message
            };
            // Redis is not critical, so don't mark as not ready
            this.logger.warn(`Redis health check failed: ${error.message}`);
        }
        */

        const readinessStatus = {
            status: isReady ? 'ready' : 'not ready',
            timestamp: new Date().toISOString(),
            checks
        };

        const statusCode = isReady ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        res.status(statusCode).json(readinessStatus);
    }

    @Get('live')
    async livenessCheck(@Res() res: Response): Promise<void> {
        // Liveness probe - same as health check
        // Kubernetes uses this to determine if the pod should be restarted
        const livenessStatus = {
            status: 'alive',
            timestamp: new Date().toISOString()
        };

        res.status(HttpStatus.OK).json(livenessStatus);
    }

}
