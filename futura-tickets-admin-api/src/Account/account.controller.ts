import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Header,
  StreamableFile,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

// MONGO
import { DeleteResult } from 'mongoose';

// DECORATORS
import { Auth } from '../Auth/auth.decorator';

// SERVICES
import {
  AccountService,
  AdminPipeService,
  PromoterPipeService,
  UserPipeService,
} from './account.service';

// INTERFACES
import {
  CreateAccount,
  Account,
  LoginAccount,
  DecodedToken,
  UpdateAccount,
  CreateAccess,
  UpdateAdminAccount,
} from './account.interface';

// DTOS
import { LoginDto } from '../common/dto';

@ApiTags('Accounts')
@Controller('accounts')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('/admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get admin accounts',
    description: 'Retrieve all admin accounts for the authenticated promoter.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of admin accounts retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async getAdminAccounts(
    @Auth(PromoterPipeService) promoter: Account,
  ): Promise<Account[]> {
    return await this.accountService.getAdminAccounts(promoter.promoter!);
  }

  @Get('/access/:event')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get access accounts for event',
    description:
      'Retrieve all access control accounts assigned to a specific event.',
  })
  @ApiParam({
    name: 'event',
    description: 'Event ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of access accounts retrieved successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token.',
  })
  async getEventAccessAccounts(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('event') event: string,
  ): Promise<Account[]> {
    return await this.accountService.getEventAccessAccounts(
      promoter.promoter!,
      event,
    );
  }

  @Delete('/admin/:account')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete admin account',
    description:
      'Delete an admin account by ID. Requires promoter authentication.',
  })
  @ApiParam({
    name: 'account',
    description: 'Account ID to delete',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin account deleted successfully.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid or missing token.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Account not found.',
  })
  async deleteAdminAccounts(
    @Auth(PromoterPipeService) promoter: Account,
    @Param('account') account: string,
  ): Promise<DeleteResult> {
    return await this.accountService.deleteAdminAccount(
      promoter.promoter!,
      account,
    );
  }

  @Post('/create')
  @ApiOperation({
    summary: 'Create new account',
    description:
      'Create a new user account. Public endpoint for user registration.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        createAccount: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Juan' },
            lastName: { type: 'string', example: 'Pérez' },
            email: { type: 'string', example: 'juan.perez@example.com' },
            password: { type: 'string', example: 'SecurePass123!' },
            phone: { type: 'string', example: '+34600123456' },
          },
          required: ['name', 'lastName', 'email', 'password'],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Account created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists.',
  })
  async createAccount(
    @Body('createAccount') createAccount: CreateAccount,
  ): Promise<Account> {
    return await this.accountService.createAccount(createAccount);
  }

  @Patch('/update')
  async updateAccount(
    @Auth(UserPipeService) user: Account,
    @Body('updateAccount') updateAccount: UpdateAccount,
  ): Promise<Account> {
    return await this.accountService.editAccount(user._id, updateAccount);
  }

  @Patch('/admin/update')
  async updateAdminAccount(
    @Auth(PromoterPipeService) user: Account,
    @Body('updateAccount') updateAccount: UpdateAdminAccount,
  ): Promise<Account> {
    return await this.accountService.editAdminAccount(user._id, updateAccount);
  }

  @Post('/create-promoter')
  async createPromoterAccount(
    @Auth(AdminPipeService) admin: Account,
    @Body('createPromoterAccount') createPromoterAccount: CreateAccount,
  ): Promise<Account> {
    return await this.accountService.createPromoterAccount(
      createPromoterAccount,
      admin.promoter!,
    );
  }

  @Post('/create-access')
  async createAccessAccount(
    @Auth(AdminPipeService) admin: Account,
    @Body('createAccessAccount') createAccessAccount: CreateAccess,
  ): Promise<Account> {
    return await this.accountService.createAccessAccount(
      createAccessAccount,
      admin.promoter!,
    );
  }

  @Post('/login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate a user with email and password. Returns user data with JWT token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful. Returns account data with JWT token.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials.',
  })
  async login(@Body() loginDto: LoginDto): Promise<Account> {
    return await this.accountService.login(loginDto as unknown as LoginAccount);
  }

  @Post('/login-google')
  async loginGoogle(@Body('googleCode') googleCode: string): Promise<any> {
    return await this.accountService.loginGoogle(googleCode);
  }

  @Post('/access/login')
  async accessLogin(@Body() loginDto: LoginDto): Promise<Account> {
    return await this.accountService.accessLogin(
      loginDto as unknown as LoginAccount,
    );
  }

  @Post('/validate')
  async validate(@Body('token') token: string): Promise<DecodedToken | null> {
    const decoded = await this.accountService.validate(token);
    if (decoded && decoded.exp > Date.now() / 1000) return decoded;
    return null;
  }

  @Get('/address/:address')
  async getAccountByAddress(
    @Param('address') address: string,
  ): Promise<Account | null> {
    return await this.accountService.getAccountByAddress(address);
  }

  @Get('export/all')
  @Header('Content-Type', 'text/csv')
  @Header(
    'Content-Disposition',
    `attachment; filename=event-all-accounts-${new Date().toISOString()}.csv`,
  )
  async exportAllClients(
    @Auth(PromoterPipeService) promoter: Account,
  ): Promise<StreamableFile> {
    try {
      const csvStream =
        await this.accountService.generateAllClientsCsvWithPromoter(promoter);
      return new StreamableFile(csvStream);
    } catch (err) {
      console.log('Error exporting event info');
      throw err; // Re-throw to handle at higher level
    }
  }
}
