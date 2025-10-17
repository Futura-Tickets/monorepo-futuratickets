/**
 * Create Event DTO
 * Validation for event creation
 */

import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  IsUrl,
  ValidateNested,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EventStatus {
  HOLD = 'HOLD',
  CREATED = 'CREATED',
  LAUNCHED = 'LAUNCHED',
  LIVE = 'LIVE',
  CLOSED = 'CLOSED',
}

export class LocationDto {
  @ApiProperty({
    description: 'Venue name',
    example: 'Estadio Azteca',
  })
  @IsString({ message: 'El lugar debe ser una cadena de texto' })
  @MinLength(2, { message: 'El lugar debe tener al menos 2 caracteres' })
  venue: string;

  @ApiProperty({
    description: 'Street address',
    example: 'Calz. de Tlalpan 3465',
  })
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  @MinLength(5, { message: 'La dirección debe tener al menos 5 caracteres' })
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'Ciudad de México',
  })
  @IsString({ message: 'La ciudad debe ser una cadena de texto' })
  @MinLength(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
  city: string;

  @ApiProperty({
    description: 'State/Province',
    example: 'CDMX',
  })
  @IsString({ message: 'El estado debe ser una cadena de texto' })
  @MinLength(2, { message: 'El estado debe tener al menos 2 caracteres' })
  state: string;

  @ApiProperty({
    description: 'Country',
    example: 'México',
  })
  @IsString({ message: 'El país debe ser una cadena de texto' })
  @MinLength(2, { message: 'El país debe tener al menos 2 caracteres' })
  country: string;

  @ApiPropertyOptional({
    description: 'ZIP/Postal code',
    example: '14210',
  })
  @IsOptional()
  @IsString({ message: 'El código postal debe ser una cadena de texto' })
  zipCode?: string;

  @ApiPropertyOptional({
    description: 'GPS coordinates',
    example: { lat: 19.3028, lng: -99.1505 },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

export class CoordinatesDto {
  @ApiProperty({ description: 'Latitude', example: 19.3028 })
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'Latitud inválida' })
  @Max(90, { message: 'Latitud inválida' })
  lat: number;

  @ApiProperty({ description: 'Longitude', example: -99.1505 })
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'Longitud inválida' })
  @Max(180, { message: 'Longitud inválida' })
  lng: number;
}

export class DateTimeDto {
  @ApiProperty({
    description: 'Launch date (when tickets go on sale)',
    example: '2024-06-01T00:00:00.000Z',
  })
  @IsDate({ message: 'Fecha de lanzamiento inválida' })
  @Type(() => Date)
  launchDate: Date;

  @ApiProperty({
    description: 'Event start date',
    example: '2024-07-15T20:00:00.000Z',
  })
  @IsDate({ message: 'Fecha de inicio inválida' })
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: 'Event end date',
    example: '2024-07-16T02:00:00.000Z',
  })
  @IsDate({ message: 'Fecha de fin inválida' })
  @Type(() => Date)
  endDate: Date;

  @ApiPropertyOptional({
    description: 'Doors open time',
    example: '19:00',
  })
  @IsOptional()
  @IsString({ message: 'La hora debe ser una cadena de texto' })
  doors?: string;

  @ApiPropertyOptional({
    description: 'Timezone',
    example: 'America/Mexico_City',
    default: 'America/Mexico_City',
  })
  @IsOptional()
  @IsString({ message: 'La zona horaria debe ser una cadena de texto' })
  timezone?: string;
}

export class TicketLotDto {
  @ApiProperty({
    description: 'Ticket type name',
    example: 'VIP',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Price per ticket',
    example: 1500,
    minimum: 0,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price: number;

  @ApiProperty({
    description: 'Quantity available',
    example: 100,
    minimum: 1,
  })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Description',
    example: 'Acceso VIP con bebidas incluidas',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Benefits list',
    example: ['Acceso anticipado', 'Meet & Greet', 'Bebidas incluidas'],
  })
  @IsOptional()
  @IsArray({ message: 'Los beneficios deben ser un array' })
  @IsString({
    each: true,
    message: 'Cada beneficio debe ser una cadena de texto',
  })
  benefits?: string[];
}

export class ArtistDto {
  @ApiProperty({
    description: 'Artist name',
    example: 'DJ Example',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Artist image URL',
    example: 'https://example.com/artist.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  image?: string;

  @ApiPropertyOptional({
    description: 'Artist bio',
    example: 'Reconocido DJ internacional...',
  })
  @IsOptional()
  @IsString({ message: 'La biografía debe ser una cadena de texto' })
  bio?: string;
}

export class ResaleConfigDto {
  @ApiProperty({
    description: 'Enable resale',
    default: false,
  })
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  enabled: boolean;

  @ApiPropertyOptional({
    description: 'Maximum resale price',
    example: 2000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio máximo debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Minimum resale price',
    example: 500,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El precio mínimo debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Resale commission percentage',
    example: 10,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La comisión debe ser un número' })
  @Min(0, { message: 'La comisión mínima es 0%' })
  @Max(100, { message: 'La comisión máxima es 100%' })
  commission?: number;
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Event name',
    example: 'Festival de Música Electrónica 2024',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Event description',
    example: 'El mejor festival de música electrónica del año...',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(20, {
    message: 'La descripción debe tener al menos 20 caracteres',
  })
  @MaxLength(2000, {
    message: 'La descripción no puede exceder 2000 caracteres',
  })
  description: string;

  @ApiProperty({
    description: 'Music genres',
    example: ['Electrónica', 'House', 'Techno'],
  })
  @IsArray({ message: 'Los géneros deben ser un array' })
  @IsString({ each: true, message: 'Cada género debe ser una cadena de texto' })
  genres: string[];

  @ApiProperty({
    description: 'Event capacity',
    example: 5000,
    minimum: 1,
  })
  @IsNumber({}, { message: 'La capacidad debe ser un número' })
  @Min(1, { message: 'La capacidad mínima es 1' })
  capacity: number;

  @ApiProperty({
    description: 'Max tickets per purchase',
    example: 10,
  })
  @IsNumber({}, { message: 'La cantidad máxima debe ser un número' })
  @Min(1, { message: 'La cantidad mínima es 1' })
  @Max(100, { message: 'La cantidad máxima es 100' })
  maxQuantity: number;

  @ApiProperty({
    description: 'Commission percentage',
    example: 5,
    default: 5,
  })
  @IsNumber({}, { message: 'La comisión debe ser un número' })
  @Min(0, { message: 'La comisión mínima es 0%' })
  @Max(100, { message: 'La comisión máxima es 100%' })
  commission: number;

  @ApiProperty({
    description: 'Event location',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({
    description: 'Event dates and times',
    type: DateTimeDto,
  })
  @ValidateNested()
  @Type(() => DateTimeDto)
  dateTime: DateTimeDto;

  @ApiProperty({
    description: 'Ticket lots/types',
    type: [TicketLotDto],
  })
  @IsArray({ message: 'Los tipos de ticket deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => TicketLotDto)
  ticketLots: TicketLotDto[];

  @ApiPropertyOptional({
    description: 'Artists',
    type: [ArtistDto],
  })
  @IsOptional()
  @IsArray({ message: 'Los artistas deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ArtistDto)
  artists?: ArtistDto[];

  @ApiPropertyOptional({
    description: 'Resale configuration',
    type: ResaleConfigDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResaleConfigDto)
  resale?: ResaleConfigDto;

  @ApiPropertyOptional({
    description: 'Use blockchain for tickets',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Debe ser un valor booleano' })
  isBlockchain?: boolean;

  @ApiProperty({
    description: 'Event image URL',
    example: 'https://example.com/event.jpg',
  })
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @MinLength(1, { message: 'La imagen del evento es requerida' })
  image: string;

  @ApiProperty({
    description: 'Ticket image URL',
    example: 'https://example.com/ticket.jpg',
  })
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @MinLength(1, { message: 'La imagen del ticket es requerida' })
  ticketImage: string;
}
