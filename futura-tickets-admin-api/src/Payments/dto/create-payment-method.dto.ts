/**
 * Create Payment Method DTO
 * Validation for payment method creation
 */

import { IsString, IsEnum, IsOptional, MinLength, MaxLength, Matches, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodType {
  BANK_ACCOUNT = 'bank_account',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  OTHER = 'other',
}

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'Payment method type',
    enum: PaymentMethodType,
    example: PaymentMethodType.BANK_ACCOUNT,
  })
  @IsEnum(PaymentMethodType, {
    message: 'Tipo de método de pago inválido',
  })
  type: PaymentMethodType;

  @ApiProperty({
    description: 'Account holder name',
    example: 'Juan Pérez',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  accountName: string;

  @ApiProperty({
    description: 'Account number',
    example: '1234567890',
  })
  @IsString({ message: 'El número de cuenta debe ser una cadena de texto' })
  @MinLength(5, {
    message: 'El número de cuenta debe tener al menos 5 caracteres',
  })
  @MaxLength(50, {
    message: 'El número de cuenta no puede exceder 50 caracteres',
  })
  accountNumber: string;

  @ApiPropertyOptional({
    description: 'Bank name',
    example: 'Banco de México',
  })
  @IsOptional()
  @IsString({ message: 'El nombre del banco debe ser una cadena de texto' })
  @MinLength(2, {
    message: 'El nombre del banco debe tener al menos 2 caracteres',
  })
  bankName?: string;

  @ApiPropertyOptional({
    description: 'Routing number',
    example: '123456789',
  })
  @IsOptional()
  @IsString({ message: 'El routing number debe ser una cadena de texto' })
  routingNumber?: string;

  @ApiPropertyOptional({
    description: 'SWIFT/BIC code',
    example: 'ABCDMXAA',
  })
  @IsOptional()
  @IsString({ message: 'El código SWIFT debe ser una cadena de texto' })
  swiftCode?: string;

  @ApiProperty({
    description: 'Country',
    example: 'México',
  })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @MinLength(2, { message: 'El país debe tener al menos 2 caracteres' })
  country: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217)',
    example: 'MXN',
  })
  @IsString({ message: 'La moneda debe ser una cadena de texto' })
  @Matches(/^[A-Z]{3}$/, {
    message: 'El código de moneda debe ser de 3 letras mayúsculas',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Set as default payment method',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
