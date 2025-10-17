import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for updating a sale/ticket (e.g., for resale)
 * Used in: PATCH /sales/:id
 */
export class UpdateSaleDto {
  @ApiPropertyOptional({
    description: 'Resale price in euros',
    example: 200.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Resale price cannot be negative' })
  resalePrice?: number;

  @ApiPropertyOptional({
    description: 'Ticket status',
    enum: ['PENDING', 'PROCESSING', 'OPEN', 'SALE', 'SOLD', 'CLOSED', 'TRANSFERED', 'EXPIRED'],
    example: 'SALE',
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PROCESSING', 'OPEN', 'SALE', 'SOLD', 'CLOSED', 'TRANSFERED', 'EXPIRED'], {
    message: 'Status must be a valid ticket status',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Transfer to account ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsString()
  transferTo?: string;
}
