import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * E2E Test: Order Creation Flow
 *
 * Tests the complete order flow including:
 * - Event creation (admin)
 * - Order creation with Stripe integration
 * - Order retrieval
 * - Payment processing
 * - Ticket generation
 */
describe('Order Flow (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;
  let userToken: string;
  let promoterToken: string;
  let testEvent: any;
  let testOrder: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        MongooseModule.forRoot(mongoUri),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
      }),
    );

    await app.init();

    // Setup: Create promoter and user accounts
    const promoterRes = await request(app.getHttpServer())
      .post('/api/accounts/register')
      .send({
        name: 'Promoter',
        lastName: 'Account',
        email: `promoter-${Date.now()}@example.com`,
        password: 'Promoter@1234',
        role: 'PROMOTER',
      });

    const userRes = await request(app.getHttpServer())
      .post('/api/accounts/register')
      .send({
        name: 'User',
        lastName: 'Account',
        email: `user-${Date.now()}@example.com`,
        password: 'User@1234',
      });

    // Login to get tokens
    const promoterLogin = await request(app.getHttpServer())
      .post('/api/accounts/login')
      .send({
        email: promoterRes.body.email,
        password: 'Promoter@1234',
      });
    promoterToken = promoterLogin.body.accessToken;

    const userLogin = await request(app.getHttpServer())
      .post('/api/accounts/login')
      .send({
        email: userRes.body.email,
        password: 'User@1234',
      });
    userToken = userLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
    await mongoServer.stop();
  });

  describe('Event Setup (Promoter)', () => {
    it('should create an event as promoter', async () => {
      const eventDto = {
        name: 'E2E Test Concert',
        description: 'Test event for E2E testing',
        capacity: 100,
        location: {
          venue: 'Test Venue',
          address: '123 Test St',
          city: 'Test City',
          country: 'Test Country',
        },
        dateTime: {
          launchDate: new Date(Date.now() + 1000).toISOString(),
          startDate: new Date(Date.now() + 86400000).toISOString(),
          endDate: new Date(Date.now() + 90000000).toISOString(),
        },
        ticketLots: [
          {
            name: 'General Admission',
            price: 50,
            quantity: 50,
          },
          {
            name: 'VIP',
            price: 100,
            quantity: 20,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/admin/events')
        .set('Authorization', `Bearer ${promoterToken}`)
        .send(eventDto)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('name', eventDto.name);
      expect(response.body).toHaveProperty('status', 'CREATED');
      expect(response.body.ticketLots).toHaveLength(2);

      testEvent = response.body;
    });

    it('should launch the event', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/events/${testEvent._id}/status`)
        .set('Authorization', `Bearer ${promoterToken}`)
        .send({ status: 'LAUNCHED' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'LAUNCHED');
    });
  });

  describe('POST /api/orders', () => {
    it('should create an order for launched event', async () => {
      const orderDto = {
        event: testEvent._id,
        items: [
          {
            type: 'General Admission',
            amount: 2,
            price: 50,
          },
        ],
        contact: {
          name: 'Test User',
          email: 'testuser@example.com',
          phone: '+1234567890',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderDto)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('paymentId'); // Stripe PaymentIntent ID
      expect(response.body).toHaveProperty('clientSecret'); // For frontend
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('total', 100); // 2 tickets * $50

      testOrder = response.body;
    });

    it('should reject order without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .send({
          event: testEvent._id,
          items: [{ type: 'General Admission', amount: 1, price: 50 }],
        })
        .expect(401);
    });

    it('should reject order with invalid event ID', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          event: '000000000000000000000000', // Invalid ObjectId
          items: [{ type: 'General Admission', amount: 1, price: 50 }],
        })
        .expect(404);
    });

    it('should reject order exceeding available tickets', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          event: testEvent._id,
          items: [
            {
              type: 'General Admission',
              amount: 100, // Exceeds available
              price: 50,
            },
          ],
        })
        .expect(400);

      expect(response.body.message).toContain('available');
    });

    it('should reject order with negative quantity', async () => {
      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          event: testEvent._id,
          items: [
            {
              type: 'General Admission',
              amount: -1,
              price: 50,
            },
          ],
        })
        .expect(400);
    });
  });

  describe('GET /api/orders', () => {
    it('should retrieve user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const order = response.body.find((o: any) => o._id === testOrder._id);
      expect(order).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer())
        .get('/api/orders')
        .expect(401);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should retrieve specific order', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('_id', testOrder._id);
      expect(response.body).toHaveProperty('event');
      expect(response.body).toHaveProperty('items');
    });

    it('should not allow user to access other users orders', async () => {
      // Create another user
      const otherUserRes = await request(app.getHttpServer())
        .post('/api/accounts/register')
        .send({
          name: 'Other',
          lastName: 'User',
          email: `other-${Date.now()}@example.com`,
          password: 'Other@1234',
        });

      const otherUserLogin = await request(app.getHttpServer())
        .post('/api/accounts/login')
        .send({
          email: otherUserRes.body.email,
          password: 'Other@1234',
        });

      // Try to access original user's order
      await request(app.getHttpServer())
        .get(`/api/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${otherUserLogin.body.accessToken}`)
        .expect(403); // Forbidden
    });

    it('should reject request with invalid order ID', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/invalid-id')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('Order Status Updates', () => {
    it('should update order status after payment (webhook simulation)', async () => {
      // This would typically be triggered by Stripe webhook
      // For E2E test, we simulate the status update directly

      const response = await request(app.getHttpServer())
        .patch(`/api/orders/${testOrder._id}/status`)
        .set('Authorization', `Bearer ${promoterToken}`) // Admin/Promoter only
        .send({ status: 'COMPLETED' })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'COMPLETED');
    });
  });

  describe('Ticket Generation', () => {
    it('should generate tickets after order completion', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/sales?order=${testOrder._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // 2 tickets ordered

      response.body.forEach((ticket: any) => {
        expect(ticket).toHaveProperty('qrCode');
        expect(ticket).toHaveProperty('status', 'OPEN');
        expect(ticket).toHaveProperty('event', testEvent._id);
      });
    });
  });
});
