/**
 * Create Account DTO
 * Validation for account creation
 */

import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsBoolean,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AccountRole {
  USER = 'USER',
  PROMOTER = 'PROMOTER',
  ADMIN = 'ADMIN',
  ACCESS = 'ACCESS',
}

export class CreateAccountDto {
  @ApiProperty({
    description: 'Account email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @ApiProperty({
    description: 'Account password (min 12 characters, must include uppercase, lowercase, number, and symbol)',
    example: 'SecurePass123!',
    minLength: 12,
  })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  @IsStrongPassword(
    {
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: 'La contraseña debe tener al menos 12 caracteres e incluir: mayúsculas, minúsculas, números y símbolos',
    },
  )
  password: string;

  @ApiProperty({
    description: 'First name',
    example: 'Juan',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Pérez',
  })
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El apellido no puede exceder 50 caracteres' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Phone number (optional)',
    example: '+52 1234567890',
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @Matches(/^\+?[\d\s-()]+$/, {
    message: 'Formato de teléfono inválido',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Account role',
    enum: AccountRole,
    default: AccountRole.USER,
  })
  @IsOptional()
  @IsEnum(AccountRole, { message: 'Rol de cuenta inválido' })
  role?: AccountRole;

  @ApiPropertyOptional({
    description: 'Email verification status',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;
}
