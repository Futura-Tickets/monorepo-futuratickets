/**
 * Create Order DTO
 * Validation for order creation
 */

import { IsString, IsNumber, IsArray, ValidateNested, Min, Max, IsOptional, IsEmail, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({
    description: 'Ticket type/name',
    example: 'VIP',
  })
  @IsString({ message: 'El tipo de ticket debe ser una cadena de texto' })
  type: string;

  @ApiProperty({
    description: 'Quantity of tickets',
    example: 2,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @Max(100, { message: 'La cantidad máxima es 100' })
  amount: number;

  @ApiProperty({
    description: 'Price per ticket',
    example: 1500,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;
}

export class ContactInfoDto {
  @ApiProperty({
    description: 'Contact name',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @ApiProperty({
    description: 'Contact email',
    example: 'juan@example.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @ApiPropertyOptional({
    description: 'Contact phone',
    example: '+52 1234567890',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Event ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'ID de evento inválido' })
  event: string;

  @ApiProperty({
    description: 'Order items (tickets)',
    type: [OrderItemDto],
  })
  @IsArray({ message: 'Los items deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Contact information',
    type: ContactInfoDto,
  })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact: ContactInfoDto;

  @ApiPropertyOptional({
    description: 'Promo code (optional)',
    example: 'SUMMER2024',
  })
  @IsOptional()
  @IsString({ message: 'El código promocional debe ser una cadena de texto' })
  promoCode?: string;

  @ApiPropertyOptional({
    description: 'Coupon code (optional)',
    example: 'EARLYBIRD',
  })
  @IsOptional()
  @IsString({ message: 'El código de cupón debe ser una cadena de texto' })
  couponCode?: string;
}
