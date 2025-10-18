import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new event
 * Used in: POST /admin/events
 */
export class LocationDto {
  @ApiProperty({
    description: 'Venue name',
    example: 'Madison Square Garden',
  })
  @IsString()
  @IsNotEmpty({ message: 'Venue name is required' })
  venue: string;

  @ApiProperty({
    description: 'Street address',
    example: '4 Pennsylvania Plaza',
  })
  @IsString()
  @IsNotEmpty({ message: 'Address is required' })
  address: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  @IsNotEmpty({ message: 'City is required' })
  city: string;

  @ApiProperty({
    description: 'Country',
    example: 'United States',
  })
  @IsString()
  @IsNotEmpty({ message: 'Country is required' })
  country: string;

  @ApiProperty({
    description: 'Postal code',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty({ message: 'Postal code is required' })
  postalCode: string;

  @ApiPropertyOptional({
    description: 'Latitude coordinate',
    example: 40.7505,
  })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude coordinate',
    example: -73.9934,
  })
  @IsOptional()
  @IsNumber()
  lon?: number;
}

export class DateTimeDto {
  @ApiProperty({
    description: 'Launch date for ticket sales',
    example: '2024-07-01T00:00:00Z',
  })
  @IsDateString({}, { message: 'Please provide a valid ISO 8601 date string for launch date' })
  @IsNotEmpty({ message: 'Launch date is required' })
  launchDate: Date;

  @ApiProperty({
    description: 'Event start date',
    example: '2024-07-15T00:00:00Z',
  })
  @IsDateString({}, { message: 'Please provide a valid ISO 8601 date string for start date' })
  @IsNotEmpty({ message: 'Start date is required' })
  startDate: Date;

  @ApiProperty({
    description: 'Event end date',
    example: '2024-07-15T23:00:00Z',
  })
  @IsDateString({}, { message: 'Please provide a valid ISO 8601 date string for end date' })
  @IsNotEmpty({ message: 'End date is required' })
  endDate: Date;

  @ApiProperty({
    description: 'Event start time',
    example: '2024-07-15T18:00:00Z',
  })
  @IsDateString({}, { message: 'Please provide a valid ISO 8601 date string for start time' })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: Date;

  @ApiProperty({
    description: 'Event end time',
    example: '2024-07-15T23:00:00Z',
  })
  @IsDateString({}, { message: 'Please provide a valid ISO 8601 date string for end time' })
  @IsNotEmpty({ message: 'End time is required' })
  endTime: Date;
}

export class TicketDto {
  @ApiProperty({
    description: 'Ticket type name',
    example: 'VIP',
  })
  @IsString()
  @IsNotEmpty({ message: 'Ticket type is required' })
  type: string;

  @ApiProperty({
    description: 'Number of tickets available',
    example: 100,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Amount must be at least 1' })
  amount: number;

  @ApiProperty({
    description: 'Ticket price in euros',
    example: 150.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Price cannot be negative' })
  price: number;
}

export class ArtistDto {
  @ApiProperty({
    description: 'Artist name',
    example: 'Taylor Swift',
  })
  @IsString()
  @IsNotEmpty({ message: 'Artist name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Artist image URL',
    example: 'https://example.com/artist.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateEventDto {
  @ApiProperty({
    description: 'Event name',
    example: 'Summer Music Festival 2024',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Event name is required' })
  @MinLength(3, { message: 'Event name must be at least 3 characters' })
  @MaxLength(200, { message: 'Event name cannot exceed 200 characters' })
  name: string;

  @ApiProperty({
    description: 'Event description',
    example: 'Annual summer music festival featuring top artists',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description: string;

  @ApiPropertyOptional({
    description: 'Event image URL',
    example: 'https://example.com/images/event.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Ticket image URL',
    example: 'https://example.com/images/ticket.jpg',
  })
  @IsOptional()
  @IsString()
  ticketImage?: string;

  @ApiProperty({
    description: 'Maximum tickets per order',
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Max quantity must be at least 1' })
  maxQuantity: number;

  @ApiProperty({
    description: 'Total event capacity',
    example: 5000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity: number;

  @ApiPropertyOptional({
    description: 'Commission percentage',
    example: 5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Commission cannot be negative' })
  commission?: number;

  @ApiProperty({
    description: 'Event location details',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  @IsNotEmpty({ message: 'Location is required' })
  location: LocationDto;

  @ApiProperty({
    description: 'Event date and time details',
    type: DateTimeDto,
  })
  @ValidateNested()
  @Type(() => DateTimeDto)
  @IsNotEmpty({ message: 'DateTime is required' })
  dateTime: DateTimeDto;

  @ApiProperty({
    description: 'Ticket types available',
    type: [TicketDto],
    minItems: 1,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets: TicketDto[];

  @ApiPropertyOptional({
    description: 'Artists performing at the event',
    type: [ArtistDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtistDto)
  artists?: ArtistDto[];

  @ApiPropertyOptional({
    description: 'Enable blockchain (NFT tickets)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isBlockchain?: boolean;
}
