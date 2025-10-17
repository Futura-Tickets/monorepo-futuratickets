import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for user login
 * Used in: POST /accounts/login
 */
export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@futuratickets.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
