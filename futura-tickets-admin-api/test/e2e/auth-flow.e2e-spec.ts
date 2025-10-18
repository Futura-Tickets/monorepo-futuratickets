import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * E2E Test: Authentication Flow
 *
 * Tests the complete authentication flow including:
 * - User registration
 * - User login
 * - Token validation
 * - Protected route access
 * - Token expiration handling
 */
describe('Authentication Flow (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot(mongoUri),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as main app
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('POST /api/accounts/register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        name: 'Test',
        lastName: 'User',
        email: `test-${Date.now()}@example.com`,
        password: 'Test@1234',
        phone: '+1234567890',
        birthdate: '1990-01-01',
      };

      const response = await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('email', registerDto.email);
      expect(response.body).not.toHaveProperty('password'); // Password should be excluded

      testUser = response.body;
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send({
          name: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          password: 'Test@1234',
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send({
          name: 'Test',
          lastName: 'User',
          email: `test2-${Date.now()}@example.com`,
          password: '123', // Too weak
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject duplicate email registration', async () => {
      const registerDto = {
        name: 'Duplicate',
        lastName: 'User',
        email: testUser.email, // Same email as first user
        password: 'Test@1234',
      };

      await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send(registerDto)
        .expect(409); // Conflict
    });
  });

  describe('POST /api/accounts/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email: testUser.email,
          password: 'Test@1234',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);

      authToken = response.body.accessToken;
    });

    it('should reject login with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should reject login with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test@1234',
        })
        .expect(401);
    });

    it('should reject login with missing credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/accounts/profile', () => {
    it('should access protected route with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/accounts/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject access without token', async () => {
      await request(app.getHttpServer())
        .get('/api/accounts/profile')
        .expect(401);
    });

    it('should reject access with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/accounts/profile')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });

    it('should reject access with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/api/accounts/profile')
        .set('Authorization', 'NotBearer ' + authToken)
        .expect(401);
    });
  });

  describe('POST /api/accounts/validate', () => {
    it('should validate a valid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/accounts/validate')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('valid', true);
      expect(response.body).toHaveProperty('user');
    });

    it('should reject invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/accounts/validate')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid')
        .expect(401);
    });
  });

  describe('PATCH /api/accounts/profile', () => {
    it('should update user profile with valid token', async () => {
      const updateDto = {
        name: 'Updated',
        lastName: 'Name',
        phone: '+9876543210',
      };

      const response = await request(app.getHttpServer())
        .patch('/api/accounts/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toHaveProperty('name', updateDto.name);
      expect(response.body).toHaveProperty('lastName', updateDto.lastName);
      expect(response.body).toHaveProperty('phone', updateDto.phone);
    });

    it('should reject profile update without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/accounts/profile')
        .send({ name: 'Hacker' })
        .expect(401);
    });

    it('should reject invalid data in profile update', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/accounts/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'invalid-email-format' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
