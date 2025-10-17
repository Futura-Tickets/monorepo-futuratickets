# DTOs (Data Transfer Objects) Documentation

This document explains the DTOs implemented across the API with class-validator decorators for automatic validation.

## Overview

DTOs provide:
- **Type Safety**: TypeScript interfaces ensure correct data structures
- **Automatic Validation**: class-validator decorators validate incoming requests
- **API Documentation**: Swagger/OpenAPI annotations auto-generate API docs
- **Error Messages**: Custom Spanish error messages for better UX

## Validation Pipeline

The ValidationPipe is globally enabled in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // Strip properties not in DTO
    transform: true,        // Transform payloads to DTO instances
    forbidNonWhitelisted: false,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

## Available DTOs

### Account DTOs

Located in `/src/Account/dto/`

#### CreateAccountDto
Validates account creation with:
- Email validation
- Password min length (6 characters)
- Name/lastName (2-50 characters)
- Phone format validation (optional)
- Role enum validation
- Email verification status

**Example:**
```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "Juan",
  "lastName": "Pérez",
  "phone": "+52 1234567890",
  "role": "USER"
}
```

#### LoginAccountDto
Validates login with:
- Email validation
- Password min length

**Example:**
```typescript
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### UpdateAccountDto
All fields optional - validates account updates with same rules as CreateAccountDto.

---

### Order DTOs

Located in `/src/Orders/dto/`

#### CreateOrderDto
Validates order creation with:
- Event ID (MongoDB ObjectId)
- Items array (tickets)
- Contact information
- Optional promo/coupon codes

**Nested DTOs:**
- **OrderItemDto**: type, amount (1-100), price (>= 0)
- **ContactInfoDto**: name, email, phone (optional)

**Example:**
```typescript
{
  "event": "507f1f77bcf86cd799439011",
  "items": [
    {
      "type": "VIP",
      "amount": 2,
      "price": 1500
    }
  ],
  "contact": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+52 1234567890"
  },
  "promoCode": "SUMMER2024"
}
```

---

### Payment DTOs

Located in `/src/Payments/dto/`

#### CreatePaymentMethodDto
Validates payment method creation with:
- Type enum: bank_account, paypal, stripe, other
- Account holder name (2+ characters)
- Account number (5-50 characters)
- Bank name (optional, 2+ characters)
- Routing number (optional)
- SWIFT code (optional)
- Country (2+ characters)
- Currency (3-letter ISO code, uppercase)
- isDefault flag

**Example:**
```typescript
{
  "type": "bank_account",
  "accountName": "Juan Pérez",
  "accountNumber": "1234567890",
  "bankName": "Banco de México",
  "routingNumber": "123456789",
  "country": "México",
  "currency": "MXN",
  "isDefault": true
}
```

#### CreatePaymentRequestDto
Validates payment withdrawal requests with:
- Amount (100 - 1,000,000)
- Payment method ID (MongoDB ObjectId)
- Notes (optional, max 500 characters)

**Example:**
```typescript
{
  "amount": 5000,
  "paymentMethodId": "507f1f77bcf86cd799439011",
  "notes": "Pago de comisiones del mes de julio"
}
```

---

### Event DTOs

Located in `/src/Event/dto/`

#### CreateEventDto
Most complex DTO - validates event creation with multiple nested DTOs:

**Main Fields:**
- name (3-100 characters)
- description (20-2000 characters)
- genres (array of strings)
- capacity (>= 1)
- maxQuantity (1-100)
- commission (0-100%)
- image URL
- ticketImage URL
- isBlockchain flag (default: true)

**Nested DTOs:**

1. **LocationDto**: venue, address, city, state, country, zipCode (optional), coordinates (optional)
2. **DateTimeDto**: launchDate, startDate, endDate, doors (optional), timezone
3. **TicketLotDto**: name, price (>= 0), quantity (>= 1), description (optional), benefits array (optional)
4. **ArtistDto**: name, image URL (optional), bio (optional)
5. **ResaleConfigDto**: enabled, maxPrice (optional), minPrice (optional), commission (0-100%, optional)

**Example:**
```typescript
{
  "name": "Festival de Música Electrónica 2024",
  "description": "El mejor festival de música electrónica del año...",
  "genres": ["Electrónica", "House", "Techno"],
  "capacity": 5000,
  "maxQuantity": 10,
  "commission": 5,
  "location": {
    "venue": "Estadio Azteca",
    "address": "Calz. de Tlalpan 3465",
    "city": "Ciudad de México",
    "state": "CDMX",
    "country": "México",
    "zipCode": "14210"
  },
  "dateTime": {
    "launchDate": "2024-06-01T00:00:00.000Z",
    "startDate": "2024-07-15T20:00:00.000Z",
    "endDate": "2024-07-16T02:00:00.000Z",
    "doors": "19:00",
    "timezone": "America/Mexico_City"
  },
  "ticketLots": [
    {
      "name": "General",
      "price": 800,
      "quantity": 4000
    },
    {
      "name": "VIP",
      "price": 1500,
      "quantity": 1000,
      "benefits": ["Acceso anticipado", "Bebidas incluidas"]
    }
  ],
  "artists": [
    {
      "name": "DJ Example",
      "image": "https://example.com/artist.jpg"
    }
  ],
  "resale": {
    "enabled": true,
    "maxPrice": 2000,
    "minPrice": 500,
    "commission": 10
  },
  "isBlockchain": true,
  "image": "https://example.com/event.jpg",
  "ticketImage": "https://example.com/ticket.jpg"
}
```

#### UpdateEventDto
Extends CreateEventDto with all fields optional (using PartialType).

---

## Usage in Controllers

### Basic Usage

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('accounts')
export class AccountController {
  @Post()
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    // DTO is automatically validated
    // Invalid data will return 400 Bad Request with error details
    return this.accountService.create(createAccountDto);
  }
}
```

### With Swagger Documentation

```typescript
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  @Post()
  @ApiOperation({ summary: 'Create a new account' })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createAccount(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }
}
```

---

## Validation Error Response

When validation fails, the API returns a 400 Bad Request with detailed error messages:

```json
{
  "statusCode": 400,
  "message": [
    "Debe ser un email válido",
    "La contraseña debe tener al menos 6 caracteres",
    "El nombre debe tener al menos 2 caracteres"
  ],
  "error": "Bad Request"
}
```

---

## Common Validators

### String Validators
- `@IsString()` - Must be a string
- `@MinLength(n)` - Minimum length
- `@MaxLength(n)` - Maximum length
- `@Matches(regex)` - Regex pattern match

### Number Validators
- `@IsNumber()` - Must be a number
- `@Min(n)` - Minimum value
- `@Max(n)` - Maximum value

### Format Validators
- `@IsEmail()` - Valid email format
- `@IsUrl()` - Valid URL format
- `@IsMongoId()` - Valid MongoDB ObjectId
- `@IsDate()` - Valid date format

### Array Validators
- `@IsArray()` - Must be an array
- `@ValidateNested({ each: true })` - Validate nested objects
- `@Type(() => NestedDto)` - Transform to nested DTO

### Conditional Validators
- `@IsOptional()` - Field is optional
- `@IsEnum(EnumType)` - Must be enum value
- `@IsBoolean()` - Must be boolean

---

## Custom Validation

You can create custom validators for complex business logic:

```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsDateAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isDateAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return value > relatedValue;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be after ${args.constraints[0]}`;
        }
      },
    });
  };
}

// Usage in DTO:
export class EventDto {
  startDate: Date;

  @IsDateAfter('startDate', { message: 'End date must be after start date' })
  endDate: Date;
}
```

---

## Best Practices

1. **Always use DTOs**: Never pass raw request bodies to services
2. **Spanish error messages**: Provide user-friendly messages in Spanish
3. **Swagger annotations**: Document all DTOs with @ApiProperty
4. **Nested validation**: Use @ValidateNested and @Type for nested objects
5. **Optional fields**: Mark optional fields with @IsOptional
6. **Enums for constants**: Use TypeScript enums for fixed value sets
7. **Transform data**: Use @Type(() => Date) for date fields
8. **Separate DTOs**: Create separate DTOs for create/update operations
9. **Reuse with PartialType**: Use PartialType for update DTOs
10. **Validate arrays**: Use { each: true } for array validation

---

## Testing DTOs

```typescript
import { validate } from 'class-validator';
import { CreateAccountDto } from './create-account.dto';

describe('CreateAccountDto', () => {
  it('should validate a valid account', async () => {
    const dto = new CreateAccountDto();
    dto.email = 'user@example.com';
    dto.password = 'SecurePass123';
    dto.name = 'Juan';
    dto.lastName = 'Pérez';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail with invalid email', async () => {
    const dto = new CreateAccountDto();
    dto.email = 'invalid-email';
    dto.password = 'SecurePass123';
    dto.name = 'Juan';
    dto.lastName = 'Pérez';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });
});
```

---

## Additional Resources

- [class-validator documentation](https://github.com/typestack/class-validator)
- [class-transformer documentation](https://github.com/typestack/class-transformer)
- [NestJS Validation Pipe](https://docs.nestjs.com/techniques/validation)
- [Swagger/OpenAPI with NestJS](https://docs.nestjs.com/openapi/introduction)
