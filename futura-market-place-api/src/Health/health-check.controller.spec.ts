import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckController, RedisHealthIndicator } from './health-check.controller';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

describe('HealthCheckController', () => {
  let controller: HealthCheckController;
  let healthCheckService: HealthCheckService;
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
    redisHealth = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return basic health status', () => {
      const result = controller.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('service', 'futura-market-place-api');
    });
  });

  describe('checkReadiness', () => {
    it('should return readiness check result', async () => {
      const mockResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          disk: { status: 'up' },
        },
        error: {},
        details: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
          disk: { status: 'up' },
        },
      };

      jest.spyOn(healthCheckService, 'check').mockResolvedValue(mockResult as any);

      const result = await controller.checkReadiness();

      expect(result).toEqual(mockResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', async () => {
      const mockRedisInfo = {
        status: 'connected',
        version: '8.2.2',
        uptime: 3600,
        host: 'localhost',
        port: 6379,
      };

      jest.spyOn(redisHealth, 'getInfo').mockResolvedValue(mockRedisInfo);

      const result = await controller.getSystemInfo();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('application');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('memory');
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('redis');
      expect(result.application).toHaveProperty('name', 'FuturaTickets Marketplace API');
      expect(result.redis).toEqual(mockRedisInfo);
    });
  });
});
