/**
 * Update Event DTO
 * Validation for event updates (all fields optional)
 */

import { PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(CreateEventDto) {}
