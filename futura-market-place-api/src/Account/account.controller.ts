import { Body, Controller, Get, Post, Patch } from '@nestjs/common';

// DECORATORS
import { Auth } from 'src/Auth/auth.decorator';

// SERVICES
import { AccountService, UserPipeService } from './account.service';

// INTERFACES
import { Account, CreateAccount, DecodedToken, LoginAccount, UpdateAccount } from './account.interface';

// DTOS
import { LoginDto } from 'src/common/dto';

@Controller('/accounts')
export class AccountController {

    constructor(
        private accountService: AccountService
    ) {}

    @Post('/register')
    async newLogin(@Body('newAccount') newAccount: CreateAccount): Promise<Account> {
        return await this.accountService.createAccount(newAccount);
    }

    @Post('/login')
    async accessLogin(@Body() loginDto: LoginDto): Promise<Account> {
        return await this.accountService.userLogin(loginDto as unknown as LoginAccount);
    }

    @Post('/login-google')
    async loginGoogle(@Body('googleCode') googleCode: string): Promise<any> {
        return await this.accountService.loginGoogle(googleCode);
    }

    @Post('/validate')
    async validate(@Body('token') token: string): Promise<DecodedToken | null> {
        const decoded = await this.accountService.validate(token);
        if (decoded && decoded.exp > Date.now() / 1000) return decoded;
        return null;
    }

    @Get('/profile')
    async getAccountInfo(@Auth(UserPipeService) user: Account): Promise<Account | null> {
        return await this.accountService.getUserInfo(user._id!);
    }

    @Patch('/update-password')
    async updatePassword(@Auth(UserPipeService) user: Account, @Body('currentPassword') currentPassword: string, @Body('newPassword') newPassword: string): Promise<Account | null> {
        return await this.accountService.updateAccountPassword(user, currentPassword, newPassword);
    }

    @Patch('/update-account')
    async updateAccountInfo(@Auth(UserPipeService) user: Account, @Body('newInfo') newInfo: UpdateAccount): Promise<Account | null> {
        return await this.accountService.updateAccountInfo(user, newInfo);
    }

    @Post('/recovery-email')
    async accountRecovery(@Body('email') email: string) {
        return await this.accountService.accountRecoveryMail(email);
    }

    @Patch('/recovery-password')
    async passwordRecovery(@Auth(UserPipeService) user: Account, @Body('newPassword') newPassword: string): Promise<boolean> {
        return await this.accountService.passwordRecovery(user, newPassword);
    }
}