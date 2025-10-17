/**
 * Create Payment Request DTO
 * Validation for payment request creation (withdrawal)
 */

import {
  IsNumber,
  IsString,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsMongoId,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentRequestDto {
  @ApiProperty({
    description: 'Amount to withdraw',
    example: 5000,
    minimum: 100,
    maximum: 1000000,
  })
  @IsNumber({}, { message: 'El monto debe ser un número' })
  @Min(100, { message: 'El monto mínimo es 100' })
  @Max(1000000, { message: 'El monto máximo es 1,000,000' })
  amount: number;

  @ApiProperty({
    description: 'Payment method ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'ID de método de pago inválido' })
  paymentMethodId: string;

  @ApiPropertyOptional({
    description: 'Additional notes (optional)',
    example: 'Pago de comisiones del mes de julio',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  @MaxLength(500, { message: 'Las notas no pueden exceder 500 caracteres' })
  notes?: string;
}
