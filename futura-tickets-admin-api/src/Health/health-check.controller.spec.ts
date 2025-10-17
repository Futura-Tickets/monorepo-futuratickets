import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckController,
  RedisHealthIndicator,
} from './health-check.controller';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;
  let healthCheckService: HealthCheckService;
  let mongooseHealth: MongooseHealthIndicator;
  let memoryHealth: MemoryHealthIndicator;
  let diskHealth: DiskHealthIndicator;
  let redisHealth: RedisHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(),
          },
        },
        {
          provide: MongooseHealthIndicator,
          useValue: {
            pingCheck: jest.fn(),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn(),
            checkRSS: jest.fn(),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest.fn(),
          },
        },
        {
          provide: RedisHealthIndicator,
          useValue: {
            isHealthy: jest.fn(),
            getInfo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthCheckController>(HealthCheckController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    mongooseHealth = module.get<MongooseHealthIndicator>(
      MongooseHealthIndicator,
    );
    memoryHealth = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
    diskHealth = module.get<DiskHealthIndicator>(DiskHealthIndicator);
    redisHealth = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return basic health status', () => {
      const result = controller.getHealth();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(result.service).toBe('futura-tickets-admin-api');
    });

    it('should include version from environment', () => {
      const originalEnv = process.env.APP_VERSION;
      process.env.APP_VERSION = '2.0.0';

      const result = controller.getHealth();

      expect(result.version).toBe('2.0.0');

      // Restore original value
      if (originalEnv) {
        process.env.APP_VERSION = originalEnv;
      } else {
        delete process.env.APP_VERSION;
      }
    });

    it('should include environment from NODE_ENV', () => {
      const result = controller.getHealth();

      expect(result.environment).toBeDefined();
      expect(['development', 'test', 'production']).toContain(
        result.environment,
      );
    });
  });

  describe('checkReadiness', () => {
    it('should call health check service with all indicators', async () => {
      const mockHealthResult: any = {
        status: 'ok',
        info: {},
        error: {},
        details: {},
      };

      jest
        .spyOn(healthCheckService, 'check')
        .mockResolvedValue(mockHealthResult);

      const result = await controller.checkReadiness();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(mockHealthResult);
    });

    it('should include database health check', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockImplementation(async (checks) => {
          // Execute all health checks
          for (const check of checks) {
            await check();
          }
          return {
            status: 'ok',
            info: {},
            error: {},
            details: {},
          } as any;
        });

      await controller.checkReadiness();

      expect(mongooseHealth.pingCheck).toHaveBeenCalledWith('database', {
        timeout: 3000,
      });
    });

    it('should include Redis health check', async () => {
      jest.spyOn(redisHealth, 'isHealthy').mockResolvedValue({
        redis: { status: 'up', message: 'Redis is responsive' },
      });

      jest
        .spyOn(healthCheckService, 'check')
        .mockImplementation(async (checks) => {
          for (const check of checks) {
            await check();
          }
          return {
            status: 'ok',
            info: {},
            error: {},
            details: {},
          } as any;
        });

      await controller.checkReadiness();

      expect(redisHealth.isHealthy).toHaveBeenCalledWith('redis');
    });

    it('should include memory health checks', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockImplementation(async (checks) => {
          for (const check of checks) {
            await check();
          }
          return {
            status: 'ok',
            info: {},
            error: {},
            details: {},
          } as any;
        });

      await controller.checkReadiness();

      expect(memoryHealth.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        150 * 1024 * 1024,
      );
      expect(memoryHealth.checkRSS).toHaveBeenCalledWith(
        'memory_rss',
        300 * 1024 * 1024,
      );
    });

    it('should include disk health check', async () => {
      jest
        .spyOn(healthCheckService, 'check')
        .mockImplementation(async (checks) => {
          for (const check of checks) {
            await check();
          }
          return {
            status: 'ok',
            info: {},
            error: {},
            details: {},
          } as any;
        });

      await controller.checkReadiness();

      expect(diskHealth.checkStorage).toHaveBeenCalledWith('disk', {
        path: expect.any(String),
        thresholdPercent: 0.9,
      });
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', async () => {
      const mockRedisInfo = {
        status: 'connected',
        version: '7.0.0',
        uptime: 3600,
        host: 'localhost',
        port: 6379,
      };

      jest.spyOn(redisHealth, 'getInfo').mockResolvedValue(mockRedisInfo);

      const result = await controller.getSystemInfo();

      expect(result).toBeDefined();
      expect(result.timestamp).toBeDefined();
      expect(result.application).toBeDefined();
      expect(result.application.name).toBe('FuturaTickets Admin API');
      expect(result.uptime).toBeDefined();
      expect(result.memory).toBeDefined();
      expect(result.cpu).toBeDefined();
      expect(result.redis).toEqual(mockRedisInfo);
    });

    it('should include memory usage information', async () => {
      jest.spyOn(redisHealth, 'getInfo').mockResolvedValue({
        status: 'connected',
      });

      const result = await controller.getSystemInfo();

      expect(result.memory).toBeDefined();
      expect(result.memory.rss).toMatch(/\d+MB/);
      expect(result.memory.heapTotal).toMatch(/\d+MB/);
      expect(result.memory.heapUsed).toMatch(/\d+MB/);
      expect(result.memory.external).toMatch(/\d+MB/);
      expect(result.memory.arrayBuffers).toMatch(/\d+MB/);
    });

    it('should include CPU usage information', async () => {
      jest.spyOn(redisHealth, 'getInfo').mockResolvedValue({
        status: 'connected',
      });

      const result = await controller.getSystemInfo();

      expect(result.cpu).toBeDefined();
      expect(typeof result.cpu.user).toBe('number');
      expect(typeof result.cpu.system).toBe('number');
    });

    it('should include application information', async () => {
      jest.spyOn(redisHealth, 'getInfo').mockResolvedValue({
        status: 'connected',
      });

      const result = await controller.getSystemInfo();

      expect(result.application).toBeDefined();
      expect(result.application.name).toBe('FuturaTickets Admin API');
      expect(result.application.nodeVersion).toBe(process.version);
      expect(result.application.platform).toBe(process.platform);
      expect(result.application.architecture).toBe(process.arch);
    });

    it('should include uptime information', async () => {
      jest.spyOn(redisHealth, 'getInfo').mockResolvedValue({
        status: 'connected',
      });

      const result = await controller.getSystemInfo();

      expect(result.uptime).toBeDefined();
      expect(result.uptime.process).toBeGreaterThanOrEqual(0);
      expect(result.uptime.system).toBeGreaterThan(0);
    });
  });
});

describe('RedisHealthIndicator', () => {
  let redisHealth: RedisHealthIndicator;

  beforeEach(() => {
    // Mock Redis connection for testing
    redisHealth = new RedisHealthIndicator();
  });

  afterEach(() => {
    // Cleanup
    if (redisHealth) {
      redisHealth.onModuleDestroy();
    }
  });

  describe('isHealthy', () => {
    it('should return healthy status when Redis responds', async () => {
      const result = await redisHealth.isHealthy('redis');

      expect(result).toBeDefined();
      expect(result.redis).toBeDefined();
      // Note: This test may fail if Redis is not running locally
      // In a real CI/CD environment, you'd use testcontainers or mock Redis
    });
  });

  describe('getInfo', () => {
    it('should return Redis connection info', async () => {
      const result = await redisHealth.getInfo();

      expect(result).toBeDefined();
      expect(result.status).toBeDefined();
      // Note: This test may show 'disconnected' if Redis is not running locally
    });
  });
});
