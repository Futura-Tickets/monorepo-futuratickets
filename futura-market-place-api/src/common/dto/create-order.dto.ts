import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsEmail,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for order items
 */
export class OrderItemDto {
  @ApiProperty({
    description: 'Ticket type',
    example: 'VIP',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ticket type is required' })
  type: string;

  @ApiProperty({
    description: 'Quantity of tickets',
    example: 2,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @ApiProperty({
    description: 'Price per ticket in euros',
    example: 150.00,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  price: number;
}

/**
 * DTO for contact details
 */
export class ContactDetailsDto {
  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  name: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  phone: string;
}

/**
 * DTO for creating a new order
 * Used in: POST /orders/create
 */
export class CreateOrderDto {
  @ApiProperty({
    description: 'Account ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty({ message: 'Account ID is required' })
  account: string;

  @ApiProperty({
    description: 'Event ID',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty({ message: 'Event ID is required' })
  event: string;

  @ApiProperty({
    description: 'Order items (tickets)',
    type: [OrderItemDto],
    minItems: 1,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'Resale items (secondary market tickets)',
    type: [OrderItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  resaleItems?: OrderItemDto[];

  @ApiProperty({
    description: 'Contact details for the order',
    type: ContactDetailsDto,
  })
  @ValidateNested()
  @Type(() => ContactDetailsDto)
  @IsNotEmpty({ message: 'Contact details are required' })
  contactDetails: ContactDetailsDto;

  @ApiPropertyOptional({
    description: 'Coupon code',
    example: 'SUMMER2024',
  })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Promo code',
    example: 'EARLY2024',
  })
  @IsOptional()
  @IsString()
  promoCode?: string;
}
