# Testing Guide for Futura Access API

## Overview

This directory contains all testing infrastructure and utilities for the Futura Access API. We use Jest as our testing framework with comprehensive mocking utilities and test helpers.

## Test Structure

```
test/
├── utils/
│   └── test-setup.ts          # Mock factories and test utilities
├── app.e2e-spec.ts            # End-to-end tests
└── README.md                  # This file
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:cov
```

### Run E2E tests
```bash
npm run test:e2e
```

### Run tests for changed files only
```bash
npm run test:related
```

### Debug tests
```bash
npm run test:debug
```

## Test Utilities

### TestDatabase

In-memory MongoDB database for integration tests:

```typescript
import { TestDatabase } from '../test/utils/test-setup';

beforeAll(async () => {
  await TestDatabase.start();
});

afterAll(async () => {
  await TestDatabase.stop();
});

beforeEach(async () => {
  await TestDatabase.clearDatabase([accountModel, eventModel]);
});
```

### Mock Factories

We provide comprehensive mock factories for all entities:

#### MockAccountFactory

```typescript
import { MockAccountFactory } from '../test/utils/test-setup';

// Create a basic user
const user = MockAccountFactory.createAccount();

// Create an ACCESS role account
const accessAccount = MockAccountFactory.createAccessAccount({
  email: 'access@test.com',
  accessEvent: 'event_id_123',
});

// Create a PROMOTER role account
const promoter = MockAccountFactory.createPromoterAccount();

// Create an ADMIN role account
const admin = MockAccountFactory.createAdminAccount();

// Create multiple accounts
const users = MockAccountFactory.createAccounts(5);
```

#### MockEventFactory

```typescript
import { MockEventFactory } from '../test/utils/test-setup';

// Create a complete event
const event = MockEventFactory.createEvent({
  name: 'Custom Event Name',
  capacity: 1000,
});

// Create a LIVE event (currently happening)
const liveEvent = MockEventFactory.createLiveEvent();
```

#### MockSaleFactory

```typescript
import { MockSaleFactory } from '../test/utils/test-setup';

// Create an OPEN ticket (ready for check-in)
const ticket = MockSaleFactory.createSale();

// Create a CLOSED ticket (already used)
const usedTicket = MockSaleFactory.createClosedSale();

// Create a ticket in resale
const resaleTicket = MockSaleFactory.createResaleSale();

// Create multiple tickets
const tickets = MockSaleFactory.createSales(10, { event: 'event_id' });
```

#### MockAuthFactory

```typescript
import { MockAuthFactory } from '../test/utils/test-setup';

// Create JWT payload
const payload = MockAuthFactory.createJwtPayload({
  role: 'ACCESS',
  email: 'test@example.com',
});

// Create ACCESS JWT payload
const accessPayload = MockAuthFactory.createAccessJwtPayload();

// Create mock token string
const token = MockAuthFactory.createMockToken();
```

### Mock Repository and Service

```typescript
import { mockRepository, mockService } from '../test/utils/test-setup';

// Mock Mongoose model
{
  provide: getModelToken(Account.name),
  useValue: mockRepository(),
}

// Mock service with specific methods
{
  provide: AuthService,
  useValue: mockService(['decodeToken', 'registerToken']),
}
```

## Writing Unit Tests

### Example: Testing a Service

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AccountService } from './account.service';
import { Account } from './account.schema';
import {
  MockAccountFactory,
  mockRepository,
  mockService,
} from '../../test/utils/test-setup';

describe('AccountService', () => {
  let service: AccountService;
  let accountModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(Account.name),
          useValue: mockRepository(),
        },
        {
          provide: AuthService,
          useValue: mockService(['decodeToken']),
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountModel = module.get(getModelToken(Account.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should find account by id', async () => {
    const mockAccount = MockAccountFactory.createAccount();
    accountModel.findById.mockResolvedValue(mockAccount);

    const result = await service.findById(mockAccount._id);

    expect(result).toEqual(mockAccount);
    expect(accountModel.findById).toHaveBeenCalledWith(mockAccount._id);
  });
});
```

## Writing Integration Tests

### Example: Testing with Real MongoDB

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TestDatabase,
  MockEventFactory,
  MockSaleFactory,
} from '../test/utils/test-setup';
import { EventService } from './event.service';
import { Event, EventSchema } from './event.schema';

describe('EventService Integration', () => {
  let service: EventService;
  let eventModel: Model<Event>;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const mongoUri = await TestDatabase.start();

    moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([
          { name: Event.name, schema: EventSchema },
        ]),
      ],
      providers: [EventService],
    }).compile();

    service = moduleRef.get<EventService>(EventService);
    eventModel = moduleRef.get(getModelToken(Event.name));
  });

  afterAll(async () => {
    await moduleRef.close();
    await TestDatabase.stop();
  });

  beforeEach(async () => {
    await TestDatabase.clearDatabase([eventModel]);
  });

  it('should validate access for OPEN ticket', async () => {
    // Arrange
    const event = await eventModel.create(MockEventFactory.createEvent());

    // Act
    const result = await service.validateAccess(event._id);

    // Assert
    expect(result).toBeDefined();
  });
});
```

## Writing E2E Tests

### Example: Testing HTTP Endpoints

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestDatabase, createTestApp } from './utils/test-setup';

describe('Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    await TestDatabase.start();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleRef);
  });

  afterAll(async () => {
    await app.close();
    await TestDatabase.stop();
  });

  describe('/accounts/login (POST)', () => {
    it('should return JWT token for valid credentials', () => {
      return request(app.getHttpServer())
        .post('/accounts/login')
        .send({
          loginAccount: {
            email: 'access@test.com',
            password: 'password123',
          },
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('token');
          expect(res.body).toHaveProperty('role', 'ACCESS');
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/accounts/login')
        .send({
          loginAccount: {
            email: 'access@test.com',
            password: 'wrongpassword',
          },
        })
        .expect(401);
    });
  });
});
```

## Coverage Goals

We aim for the following coverage thresholds:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('should do something', async () => {
  // Arrange - Set up test data
  const mockData = MockAccountFactory.createAccount();

  // Act - Execute the function under test
  const result = await service.doSomething(mockData);

  // Assert - Verify the result
  expect(result).toBeDefined();
});
```

### 2. Clear Test Descriptions

```typescript
// Good
it('should throw UnauthorizedException when password is incorrect', ...);

// Bad
it('should work', ...);
```

### 3. Test One Thing at a Time

```typescript
// Good - One assertion per test
it('should return user data', async () => {
  const result = await service.getUser('id');
  expect(result).toHaveProperty('email');
});

it('should include user role', async () => {
  const result = await service.getUser('id');
  expect(result.role).toBe('ACCESS');
});

// Bad - Multiple unrelated assertions
it('should do everything', async () => {
  const result = await service.getUser('id');
  expect(result).toHaveProperty('email');
  expect(result.role).toBe('ACCESS');
  expect(otherThing).toBe(true);
});
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  await TestDatabase.stop();
});
```

### 5. Use Realistic Mock Data

```typescript
// Good - Use faker for realistic data
const account = MockAccountFactory.createAccount();

// Bad - Hardcoded unrealistic data
const account = { email: 'test', password: '123' };
```

## Common Testing Patterns

### Testing Authorization Guards

```typescript
it('should deny access without token', async () => {
  await expect(
    pipe.transform('invalid.token', {} as any)
  ).rejects.toThrow(UnauthorizedException);
});
```

### Testing Password Validation

```typescript
import * as passwordUtils from '../utils/password';

jest.spyOn(passwordUtils, 'comparePassword').mockResolvedValue(true);
```

### Testing Database Queries

```typescript
accountModel.find.mockReturnValue({
  select: jest.fn().mockReturnValue({
    sort: jest.fn().mockResolvedValue(mockAccounts),
  }),
});
```

## Troubleshooting

### MongoDB Memory Server Not Starting

If you get errors with mongodb-memory-server:

```bash
# Clear cache
rm -rf ~/.cache/mongodb-memory-server

# Reinstall
npm install --save-dev mongodb-memory-server
```

### Tests Hanging

Ensure you're properly closing connections:

```typescript
afterAll(async () => {
  await moduleRef.close();
  await TestDatabase.stop();
});
```

### Mock Not Being Called

Check that you're using the correct spy syntax:

```typescript
// Correct
expect(mockService.method).toHaveBeenCalled();

// Wrong
expect(service.method).toHaveBeenCalled();
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Supertest Documentation](https://github.com/ladjs/supertest)

## Contributing

When adding new features, always include:

1. Unit tests for services
2. Integration tests for complex workflows
3. E2E tests for new API endpoints
4. Update this README if you add new test utilities

---

**Happy Testing!**
