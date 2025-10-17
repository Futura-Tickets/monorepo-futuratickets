import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'test',
                PORT: 3001,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const result = appController.getHello();
      expect(result).toBe('Hello World!');
    });

    it('should call appService.getHello', () => {
      jest.spyOn(appService, 'getHello');
      appController.getHello();
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('getHealth', () => {
    it('should return health status object', () => {
      const result = appController.getHealth();

      expect(result).toBeDefined();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('environment');
      expect(result).toHaveProperty('service');
    });

    it('should have status "ok"', () => {
      const result = appController.getHealth();
      expect(result.status).toBe('ok');
    });

    it('should have valid timestamp', () => {
      const result = appController.getHealth();
      const timestamp = new Date(result.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    it('should have uptime greater than or equal to 0', () => {
      const result = appController.getHealth();
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(typeof result.uptime).toBe('number');
    });

    it('should have version "1.0.0"', () => {
      const result = appController.getHealth();
      expect(result.version).toBe('1.0.0');
    });

    it('should have environment from NODE_ENV', () => {
      const result = appController.getHealth();
      expect(result.environment).toBeDefined();
      expect(['development', 'test', 'production', 'staging']).toContain(
        result.environment,
      );
    });

    it('should have service name "futura-tickets-admin-api"', () => {
      const result = appController.getHealth();
      expect(result.service).toBe('futura-tickets-admin-api');
    });

    it('should return different timestamps on consecutive calls', async () => {
      const result1 = appController.getHealth();

      // Wait a small amount of time
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result2 = appController.getHealth();

      expect(result1.timestamp).not.toBe(result2.timestamp);
    });

    it('should include all required health check fields', () => {
      const result = appController.getHealth();
      const requiredFields = [
        'status',
        'timestamp',
        'uptime',
        'version',
        'environment',
        'service',
      ];

      requiredFields.forEach((field) => {
        expect(result).toHaveProperty(field);
        expect(result[field]).toBeDefined();
      });
    });
  });
});
