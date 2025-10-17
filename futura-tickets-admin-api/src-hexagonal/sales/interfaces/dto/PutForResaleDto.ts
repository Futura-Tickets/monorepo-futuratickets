import { IsNumber, IsString, IsNotEmpty, Min } from 'class-validator';

/**
 * PutForResaleDto
 *
 * DTO para poner un ticket en reventa
 * Interfaces Layer
 */
export class PutForResaleDto {
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  resalePrice: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  maxResalePrice: number;

  @IsString()
  @IsNotEmpty()
  accountPrivateKey: string;

  @IsString()
  @IsNotEmpty()
  eventAddress: string;

  @IsNumber()
  @IsNotEmpty()
  tokenId: number;
}
