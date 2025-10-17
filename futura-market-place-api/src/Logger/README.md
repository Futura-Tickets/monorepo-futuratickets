# Logger Module

Structured logging system using Winston for the Futura Tickets Admin API.

## Features

- **Structured Logging**: JSON format for easy parsing and analysis
- **Multiple Transports**: Console, file, error, warnings
- **Log Levels**: debug, info, warn, error
- **Environment-based**: Different log levels per environment
- **File Rotation**: Automatic rotation with size limits
- **HTTP Request Logging**: Automatic logging of all HTTP requests with timing
- **Specialized Methods**: Auth logging, business events, security events, performance tracking

## Log Levels by Environment

- **Development**: `debug` (logs everything)
- **Staging**: `debug`
- **Production**: `info` (errors, warnings, and info only)

## Log Files

All log files are stored in the `logs/` directory at the project root:

- `combined.log` - All logs
- `error.log` - Error level logs only
- `warnings.log` - Warning level logs
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled promise rejections

Files automatically rotate when they reach 5MB, keeping the last 5 files.

## Usage

### Basic Logging

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../Logger/logger.service';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  someMethod() {
    // Info level
    this.logger.log('User created successfully', 'MyService');

    // With metadata
    this.logger.log('User created successfully', 'MyService', {
      userId: '123',
      email: 'user@example.com'
    });

    // Warning
    this.logger.warn('Deprecated method called', 'MyService', {
      method: 'oldMethod',
      replacement: 'newMethod'
    });

    // Error
    try {
      // ... some code
    } catch (error) {
      this.logger.error(
        'Failed to create user',
        error.stack,
        'MyService',
        { userId: '123' }
      );
    }

    // Debug (only in development)
    this.logger.debug('Processing user data', 'MyService', {
      step: 'validation'
    });
  }
}
```

### Authentication Logging

```typescript
export class AuthService {
  constructor(private readonly logger: LoggerService) {}

  async login(email: string, password: string) {
    try {
      const user = await this.validateUser(email, password);

      // Log successful login
      this.logger.logAuth('login', user.id, {
        email: user.email,
        ip: request.ip
      });

      return user;
    } catch (error) {
      // Log failed login
      this.logger.logAuth('failed_login', null, {
        email,
        reason: error.message,
        ip: request.ip
      });
      throw error;
    }
  }
}
```

### Business Event Logging

```typescript
export class OrdersService {
  constructor(private readonly logger: LoggerService) {}

  async createOrder(orderData: CreateOrderDto) {
    const order = await this.ordersRepository.save(orderData);

    // Log business event
    this.logger.logBusinessEvent(
      'order_created',
      'Order',
      order.id,
      {
        total: order.total,
        items: order.items.length,
        userId: order.userId
      }
    );

    return order;
  }
}
```

### Security Event Logging

```typescript
export class SecurityService {
  constructor(private readonly logger: LoggerService) {}

  detectSuspiciousActivity(userId: string, activity: string) {
    this.logger.logSecurity(
      'suspicious_activity_detected',
      'high',
      {
        userId,
        activity,
        ip: request.ip,
        userAgent: request.headers['user-agent']
      }
    );
  }
}
```

### Performance Logging

```typescript
export class EventsService {
  constructor(private readonly logger: LoggerService) {}

  async getEvents() {
    const startTime = Date.now();

    const events = await this.eventsRepository.find();

    const duration = Date.now() - startTime;

    // Log performance metric
    this.logger.logPerformance('get_events', duration, {
      resultCount: events.length
    });

    return events;
  }
}
```

### External API Call Logging

```typescript
export class StripeService {
  constructor(private readonly logger: LoggerService) {}

  async createPaymentIntent(amount: number) {
    const startTime = Date.now();

    try {
      const paymentIntent = await stripe.paymentIntents.create({ amount });

      const duration = Date.now() - startTime;

      this.logger.logExternalCall(
        'Stripe',
        '/v1/payment_intents',
        200,
        duration,
        { paymentIntentId: paymentIntent.id }
      );

      return paymentIntent;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.logExternalCall(
        'Stripe',
        '/v1/payment_intents',
        error.statusCode || 500,
        duration,
        { error: error.message }
      );

      throw error;
    }
  }
}
```

## HTTP Request Logging

All HTTP requests are automatically logged with:
- HTTP method
- URL
- Status code
- Duration in milliseconds
- User ID (if authenticated)

This is handled by the `HttpLoggerInterceptor` which is globally registered in `main.ts`.

Requests taking longer than 3 seconds are automatically logged as warnings.

## Configuration

The logger configuration is in `src/config/logger.config.ts`.

You can customize:
- Log levels per environment
- File paths and names
- File rotation settings
- Log formats

## Best Practices

1. **Always include context**: Pass the service/class name as the context parameter
2. **Use appropriate log levels**:
   - `debug`: Detailed information for debugging
   - `info`: General informational messages
   - `warn`: Warning messages (deprecated features, non-critical issues)
   - `error`: Error messages (exceptions, failures)
3. **Include metadata**: Add relevant context data as metadata objects
4. **Don't log sensitive data**: Never log passwords, tokens, credit cards, etc.
5. **Use specialized methods**: Use `logAuth`, `logBusinessEvent`, etc. for structured logging
6. **Log errors with stack traces**: Always include the error stack in error logs

## Example Service with Comprehensive Logging

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../Logger/logger.service';

@Injectable()
export class UserService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const startTime = Date.now();

    this.logger.debug(
      'Creating user',
      'UserService',
      { email: createUserDto.email }
    );

    try {
      // Check if user exists
      const existingUser = await this.userRepository.findByEmail(
        createUserDto.email
      );

      if (existingUser) {
        this.logger.warn(
          'Attempted to create duplicate user',
          'UserService',
          { email: createUserDto.email }
        );
        throw new ConflictException('User already exists');
      }

      // Create user
      const user = await this.userRepository.create(createUserDto);

      // Log business event
      this.logger.logBusinessEvent(
        'user_created',
        'User',
        user.id,
        {
          email: user.email,
          role: user.role
        }
      );

      // Log performance
      const duration = Date.now() - startTime;
      this.logger.logPerformance('create_user', duration);

      return user;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error(
        `Failed to create user: ${error.message}`,
        error.stack,
        'UserService',
        {
          email: createUserDto.email,
          duration
        }
      );

      throw error;
    }
  }
}
```

## Monitoring and Analysis

Log files can be:
- Parsed with log analysis tools (ELK Stack, Splunk, etc.)
- Monitored with services like Sentry or LogRocket
- Analyzed for performance bottlenecks
- Used for security auditing
- Integrated with alerting systems

For production, consider shipping logs to a centralized logging service.
