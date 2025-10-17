/**
 * Test Setup and Utilities for Futura Access API
 *
 * This file provides comprehensive testing utilities including:
 * - In-memory MongoDB database setup
 * - Mock factories for entities (Account, Event, Sale, Promoter)
 * - Test helpers and utilities
 * - Example test patterns
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Model } from 'mongoose';
import * as request from 'supertest';
import { Roles } from '../../src/Account/account.interface';

// Simple faker replacement for testing (avoids ESM issues)
const faker = {
  database: {
    mongodbObjectId: () => Math.random().toString(24).substring(2, 26),
  },
  person: {
    firstName: () => 'John',
    lastName: () => 'Doe',
  },
  internet: {
    email: () => `test${Math.random().toString(36).substring(7)}@example.com`,
    password: () => 'Password123!',
    domainName: () => 'example.com',
  },
  phone: {
    number: () => '+1234567890',
  },
  date: {
    past: (opts?: any) => new Date(Date.now() - 86400000),
    recent: () => new Date(),
    future: (opts?: any) => new Date(Date.now() + 86400000),
  },
  finance: {
    ethereumAddress: () => '0x' + '0'.repeat(40),
  },
  string: {
    hexadecimal: (opts: any) => '0x' + '0'.repeat(opts.length),
    alphanumeric: (length: number) => 'a'.repeat(length),
  },
  lorem: {
    words: (count: number) => Array(count).fill('word').join(' '),
    paragraph: () => 'This is a test paragraph for testing purposes.',
  },
  company: {
    name: () => 'Test Company Inc',
  },
  image: {
    url: () => 'https://example.com/image.jpg',
  },
  number: {
    int: (opts: any) => opts.max || 100,
    float: (opts: any) => opts.max || 100.0,
  },
  music: {
    genre: () => 'Rock',
  },
  location: {
    streetAddress: () => '123 Main St',
    city: () => 'New York',
    state: () => 'NY',
    country: () => 'USA',
    zipCode: () => '10001',
  },
  helpers: {
    arrayElement: (arr: any[]) => arr[0],
  },
};

/**
 * =========================================================================
 * TEST DATABASE CONFIGURATION
 * =========================================================================
 */

/**
 * In-Memory MongoDB Server
 * Used for integration tests without affecting real database
 */
export class TestDatabase {
  private static mongod: MongoMemoryServer;

  /**
   * Start in-memory MongoDB server
   */
  static async start(): Promise<string> {
    if (!TestDatabase.mongod) {
      TestDatabase.mongod = await MongoMemoryServer.create({
        instance: {
          dbName: 'test-futura-access',
        },
      });
    }
    return TestDatabase.mongod.getUri();
  }

  /**
   * Stop in-memory MongoDB server
   */
  static async stop(): Promise<void> {
    if (TestDatabase.mongod) {
      await TestDatabase.mongod.stop();
    }
  }

  /**
   * Clear all data from database
   */
  static async clearDatabase(models: Model<any>[]): Promise<void> {
    for (const model of models) {
      await model.deleteMany({});
    }
  }

  /**
   * Get MongoDB URI
   */
  static async getUri(): Promise<string> {
    if (!TestDatabase.mongod) {
      return await TestDatabase.start();
    }
    return TestDatabase.mongod.getUri();
  }
}

/**
 * =========================================================================
 * MOCK FACTORIES
 * =========================================================================
 */

/**
 * Mock Account Factory
 * Creates mock accounts for testing (ACCESS, PROMOTER, USER roles)
 */
export class MockAccountFactory {
  /**
   * Create a basic user account
   */
  static createAccount(overrides: Partial<any> = {}) {
    return {
      _id: faker.database.mongodbObjectId(),
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      password: '$2a$10$hashedpassword123',
      phone: faker.phone.number(),
      role: Roles.USER,
      registered: true,
      active: true,
      address: faker.finance.ethereumAddress(),
      key: faker.string.hexadecimal({ length: 64 }),
      mnemonic: faker.lorem.words(12),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Create multiple accounts
   */
  static createAccounts(count: number, overrides: Partial<any> = {}): any[] {
    return Array.from({ length: count }, (_, i) =>
      MockAccountFactory.createAccount({
        ...overrides,
        email: `user${i}@${faker.internet.domainName()}`,
      }),
    );
  }

  /**
   * Create an ACCESS role account (for event check-in)
   */
  static createAccessAccount(overrides: Partial<any> = {}) {
    return MockAccountFactory.createAccount({
      role: Roles.ACCESS,
      accessEvent: faker.database.mongodbObjectId(),
      accessPass: faker.internet.password(),
      promoter: faker.database.mongodbObjectId(),
      ...overrides,
    });
  }

  /**
   * Create a PROMOTER role account
   */
  static createPromoterAccount(overrides: Partial<any> = {}) {
    return MockAccountFactory.createAccount({
      role: Roles.PROMOTER,
      promoter: faker.database.mongodbObjectId(),
      ...overrides,
    });
  }

  /**
   * Create an ADMIN role account
   */
  static createAdminAccount(overrides: Partial<any> = {}) {
    return MockAccountFactory.createAccount({
      role: Roles.ADMIN,
      ...overrides,
    });
  }
}

/**
 * Mock Promoter Factory
 */
export class MockPromoterFactory {
  static createPromoter(overrides: Partial<any> = {}) {
    return {
      _id: faker.database.mongodbObjectId(),
      name: faker.company.name(),
      address: faker.finance.ethereumAddress(),
      key: faker.string.hexadecimal({ length: 64 }),
      mnemonic: faker.lorem.words(12),
      image: faker.image.url(),
      icon: faker.image.url(),
      events: [],
      clients: [],
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }
}

/**
 * Mock Event Factory
 */
export class MockEventFactory {
  /**
   * Create a complete event with all required fields
   */
  static createEvent(overrides: Partial<any> = {}) {
    const eventDate = faker.date.future();
    return {
      _id: faker.database.mongodbObjectId(),
      promoter: faker.database.mongodbObjectId(),
      name: `${faker.music.genre()} Festival ${faker.number.int({ min: 2024, max: 2026 })}`,
      description: faker.lorem.paragraph(),
      image: faker.image.url(),
      ticketImage: faker.image.url(),
      capacity: faker.number.int({ min: 100, max: 10000 }),
      commission: faker.number.float({ min: 5, max: 15, fractionDigits: 2 }),
      location: {
        venue: faker.company.name() + ' Arena',
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        postalCode: faker.location.zipCode(),
      },
      dateTime: {
        startDate: eventDate,
        endDate: faker.date.future({ refDate: eventDate }),
        startTime: eventDate,
        endTime: faker.date.future({ refDate: eventDate }),
      },
      tickets: [
        {
          type: 'General',
          amount: faker.number.int({ min: 50, max: 500 }),
          price: faker.number.int({ min: 3000, max: 8000 }), // In cents
        },
        {
          type: 'VIP',
          amount: faker.number.int({ min: 10, max: 100 }),
          price: faker.number.int({ min: 10000, max: 25000 }),
        },
      ],
      status: 'PUBLISHED',
      isBlockchain: true,
      address: faker.finance.ethereumAddress(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Create a live event (currently happening)
   */
  static createLiveEvent(overrides: Partial<any> = {}) {
    const now = new Date();
    return MockEventFactory.createEvent({
      dateTime: {
        startDate: faker.date.past({ refDate: now }),
        endDate: faker.date.future({ refDate: now }),
        startTime: faker.date.past({ refDate: now }),
        endTime: faker.date.future({ refDate: now }),
      },
      status: 'LIVE',
      ...overrides,
    });
  }
}

/**
 * Mock Sale/Ticket Factory
 */
export class MockSaleFactory {
  /**
   * Create a ticket/sale with OPEN status (ready for check-in)
   */
  static createSale(overrides: Partial<any> = {}) {
    return {
      _id: faker.database.mongodbObjectId(),
      client: faker.database.mongodbObjectId(),
      event: faker.database.mongodbObjectId(),
      order: faker.database.mongodbObjectId(),
      promoter: faker.database.mongodbObjectId(),
      tokenId: faker.number.int({ min: 1, max: 10000 }),
      type: faker.helpers.arrayElement(['General', 'VIP', 'Premium']),
      price: faker.number.int({ min: 3000, max: 25000 }),
      qrCode: faker.string.alphanumeric(32),
      status: 'OPEN',
      history: [],
      signature: faker.string.hexadecimal({ length: 130 }),
      hash: faker.string.hexadecimal({ length: 66 }),
      blockNumber: faker.number.int({ min: 1000000, max: 9999999 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }

  /**
   * Create a CLOSED ticket (already used for check-in)
   */
  static createClosedSale(overrides: Partial<any> = {}) {
    return MockSaleFactory.createSale({
      status: 'CLOSED',
      history: [
        {
          activity: 'GRANTED',
          reason: 'Access granted',
          status: 'CLOSED',
          createdAt: faker.date.recent(),
        },
      ],
      ...overrides,
    });
  }

  /**
   * Create a ticket in resale
   */
  static createResaleSale(overrides: Partial<any> = {}) {
    return MockSaleFactory.createSale({
      status: 'SALE',
      resale: {
        resalePrice: faker.number.int({ min: 3000, max: 20000 }),
        resaleDate: faker.date.recent(),
      },
      ...overrides,
    });
  }

  /**
   * Create multiple sales
   */
  static createSales(count: number, overrides: Partial<any> = {}): any[] {
    return Array.from({ length: count }, () =>
      MockSaleFactory.createSale(overrides),
    );
  }
}

/**
 * Mock Order Factory
 */
export class MockOrderFactory {
  static createOrder(overrides: Partial<any> = {}) {
    return {
      _id: faker.database.mongodbObjectId(),
      account: faker.database.mongodbObjectId(),
      event: faker.database.mongodbObjectId(),
      promoter: faker.database.mongodbObjectId(),
      items: [
        {
          sale: faker.database.mongodbObjectId(),
          type: 'General',
          amount: faker.number.int({ min: 1, max: 5 }),
          price: faker.number.int({ min: 3000, max: 8000 }),
        },
      ],
      sales: [],
      paymentId: `pi_${faker.string.alphanumeric(24)}`,
      contactDetails: {
        name: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
      status: 'SUCCEEDED',
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      ...overrides,
    };
  }
}

/**
 * Mock JWT Payload Factory
 */
export class MockAuthFactory {
  /**
   * Create a JWT payload for testing
   */
  static createJwtPayload(overrides: Partial<any> = {}) {
    return {
      account: faker.database.mongodbObjectId(),
      name: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      role: Roles.USER,
      address: faker.finance.ethereumAddress(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      ...overrides,
    };
  }

  /**
   * Create JWT payload for ACCESS role
   */
  static createAccessJwtPayload(overrides: Partial<any> = {}) {
    return MockAuthFactory.createJwtPayload({
      role: Roles.ACCESS,
      accessEvent: faker.database.mongodbObjectId(),
      ...overrides,
    });
  }

  /**
   * Create a mock access token (not real JWT, just for testing)
   */
  static createMockToken(): string {
    return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${faker.string.alphanumeric(100)}.${faker.string.alphanumeric(50)}`;
  }
}

/**
 * =========================================================================
 * TEST UTILITIES
 * =========================================================================
 */

/**
 * Create Test Module
 * Helper to create NestJS testing module with MongoDB
 */
export async function createTestModule(
  imports: any[] = [],
  providers: any[] = [],
  controllers: any[] = [],
): Promise<TestingModule> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      MongooseModule.forRootAsync({
        useFactory: async () => ({
          uri: await TestDatabase.getUri(),
        }),
      }),
      ...imports,
    ],
    controllers,
    providers,
  }).compile();

  return moduleRef;
}

/**
 * Create Test Application
 * Helper to create full NestJS application for E2E tests
 */
export async function createTestApp(
  moduleRef: TestingModule,
): Promise<INestApplication> {
  const app = moduleRef.createNestApplication();

  // Apply global pipes (same as production)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

/**
 * Mock Repository
 * Generic mock for Mongoose models
 */
export function mockRepository<T>() {
  return {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    lean: jest.fn().mockReturnThis(),
  };
}

/**
 * Mock Service
 * Generic mock for services with specified methods
 */
export function mockService<T>(methods: string[]): jest.Mocked<T> {
  const mock: any = {};
  methods.forEach((method) => {
    mock[method] = jest.fn();
  });
  return mock as jest.Mocked<T>;
}

/**
 * Clean test data helper
 */
export async function cleanupTestData(models: Model<any>[]) {
  await TestDatabase.clearDatabase(models);
}
