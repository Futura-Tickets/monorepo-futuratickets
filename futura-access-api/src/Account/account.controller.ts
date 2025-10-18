import { Body, Controller, Post, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

// SERVICES
import { AccountService } from './account.service';

// INTERFACES
import { Account, DecodedToken, LoginAccount } from './account.interface';

// DTOS
import { LoginDto, ValidateTokenDto } from 'src/common/dto';

@ApiTags('Authentication')
@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('/login')
  @ApiOperation({
    summary: 'Access personnel login',
    description:
      'Authenticate access control personnel with email and password. Returns account data with JWT token and assigned event details.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful. Returns account data with JWT token and event assignment.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials or not an ACCESS role user.',
  })
  async accessLogin(@Body() loginDto: LoginDto): Promise<Account> {
    return await this.accountService.accessLogin(loginDto as unknown as LoginAccount);
  }

  @Post('/validate')
  @ApiOperation({
    summary: 'Validate JWT token',
    description: 'Verify if a JWT token is valid and not expired. Returns decoded token payload if valid.',
  })
  @ApiBody({ type: ValidateTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is valid. Returns decoded payload.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token is invalid or expired. Returns null.',
  })
  async validate(@Body() validateTokenDto: ValidateTokenDto): Promise<DecodedToken | null> {
    const decoded = await this.accountService.validate(validateTokenDto.token);
    if (decoded && decoded.exp > Date.now() / 1000) return decoded;
    return null;
  }
}
