import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  LocationDto,
  DateTimeDto,
  TicketDto,
  ArtistDto,
} from './create-event.dto';

/**
 * DTO for updating an existing event
 * Used in: PATCH /admin/events/:id
 * All fields are optional
 */
export class UpdateEventDto {
  @ApiPropertyOptional({
    description: 'Event name',
    example: 'Summer Music Festival 2024',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Event name must be at least 3 characters' })
  @MaxLength(200, { message: 'Event name cannot exceed 200 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Event description',
    example: 'Updated description',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

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

  @ApiPropertyOptional({
    description: 'Maximum tickets per order',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Max quantity must be at least 1' })
  maxQuantity?: number;

  @ApiPropertyOptional({
    description: 'Total event capacity',
    example: 5000,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Capacity must be at least 1' })
  capacity?: number;

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

  @ApiPropertyOptional({
    description: 'Event location details',
    type: LocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiPropertyOptional({
    description: 'Event date and time details',
    type: DateTimeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateTimeDto)
  dateTime?: DateTimeDto;

  @ApiPropertyOptional({
    description: 'Ticket types available',
    type: [TicketDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets?: TicketDto[];

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

  @ApiPropertyOptional({
    description: 'Event status',
    enum: ['HOLD', 'CREATED', 'LAUNCHED', 'LIVE', 'CLOSED'],
    example: 'LAUNCHED',
  })
  @IsOptional()
  @IsEnum(['HOLD', 'CREATED', 'LAUNCHED', 'LIVE', 'CLOSED'], {
    message: 'Status must be one of: HOLD, CREATED, LAUNCHED, LIVE, CLOSED',
  })
  status?: string;
}
