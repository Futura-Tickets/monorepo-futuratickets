import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for validating access (ticket check-in)
 * Used in: PATCH /events/access
 */
export class ValidateAccessDto {
  @ApiProperty({
    description: 'Sale ID (ticket ID) to validate',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty({ message: 'Sale ID is required' })
  sale: string;
}
