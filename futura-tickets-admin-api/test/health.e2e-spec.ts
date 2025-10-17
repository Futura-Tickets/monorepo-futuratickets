import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health Endpoints (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return 200 OK with health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('details');
        });
    });

    it('should include database and redis health checks', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.details).toHaveProperty('database');
          expect(res.body.details).toHaveProperty('redis');
        });
    });
  });

  describe('/health/ready (GET)', () => {
    it('should return 200 OK when service is ready', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });

    it('should check critical dependencies', () => {
      return request(app.getHttpServer())
        .get('/health/ready')
        .expect(200)
        .expect((res) => {
          expect(res.body.details).toHaveProperty('database');
          expect(res.body.details).toHaveProperty('redis');
          expect(res.body.details).toHaveProperty('memory_heap');
          expect(res.body.details).toHaveProperty('memory_rss');
          expect(res.body.details).toHaveProperty('disk');
        });
    });
  });

  describe('/health/info (GET)', () => {
    it('should return 200 OK with system information', () => {
      return request(app.getHttpServer())
        .get('/health/info')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('info');
        });
    });

    it('should include uptime and memory usage', () => {
      return request(app.getHttpServer())
        .get('/health/info')
        .expect(200)
        .expect((res) => {
          expect(res.body.info).toHaveProperty('uptime');
          expect(res.body.info).toHaveProperty('memory');
        });
    });
  });
});
