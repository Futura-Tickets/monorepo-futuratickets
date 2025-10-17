import { IsString, IsNotEmpty } from 'class-validator';

/**
 * ValidateTicketDto
 *
 * DTO para validar entrada de un ticket
 * Interfaces Layer
 */
export class ValidateTicketDto {
  @IsString()
  @IsNotEmpty()
  ticketId: string;
}
