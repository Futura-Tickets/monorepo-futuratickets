import { ArgumentMetadata, Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Account as AccountModel, AccountDocument } from './account.schema';

// SERVICES
import { AuthService } from 'src/Auth/services/auth.service';

// UTILS
import { comparePassword } from '../utils/password';

// INTERFACES
import { Account, DecodedToken, LoginAccount, Roles } from './account.interface';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(AccountModel.name)
    private accountModel: Model<AccountDocument>,
    private authService: AuthService,
  ) {}

  public async validate(token: string): Promise<DecodedToken> {
    return await this.authService.decodeToken(token);
  }

  public async getEventAccessAccounts(promoter: string, accessEvent: string): Promise<Account[]> {
    return await this.accountModel
      .find({ promoter, accessEvent })
      .select({
        name: 1,
        lastName: 1,
        email: 1,
        role: 1,
        accessEvent: 1,
        accessPass: 1,
      })
      .sort({ createdAt: 'asc' });
  }

  public async getPromoterAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel
      .findOne({
        _id: accountId,
        $or: [{ role: 'ADMIN' }, { role: 'PROMOTER' }],
      })
      .select({ _id: 1, promoter: 1 });
  }

  public async getAccessAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel.findOne({ _id: accountId, role: 'ACCESS' }).select({ _id: 1, promoter: 1 });
  }

  public async getAccessAccountByEmail(accountEmail: string): Promise<Account | null> {
    return await this.accountModel
      .findOne<Account>({ email: accountEmail, role: Roles.ACCESS })
      .populate({
        path: 'promoter',
        model: 'Promoter',
        select: { name: 1, createdAt: 1 },
      })
      .populate({
        path: 'accessEvent',
        model: 'Event',
        select: { name: 1, createdAt: 1 },
      });
  }

  public async accessLogin(loginAccount: LoginAccount): Promise<Account> {
    const account = await this.getAccessAccountByEmail(loginAccount.email);
    if (account && account.registered) {
      // CHECK IF PASSWORD MATCH
      const passwordMatch = await comparePassword(loginAccount.password, account.password);
      if (passwordMatch) {
        return {
          _id: account._id,
          name: account.name,
          lastName: account.lastName,
          promoter: account.promoter,
          accessEvent: account.accessEvent,
          role: account.role,
          email: account.email,
          address: account.address,
          token: await this.authService.registerToken({
            account: account._id,
            name: account.name,
            lastName: account.lastName,
            promoter: account.promoter,
            accessEvent: account.accessEvent,
            role: account.role,
            email: account.email,
            address: account.address,
          }),
        };
      }
      throw new UnauthorizedException('Error Login In!');
    }
    throw new UnauthorizedException('Error Login In!');
  }
}

@Injectable()
export class PromoterPipeService implements PipeTransform {
  constructor(
    private accountService: AccountService,
    private authService: AuthService,
  ) {}

  public async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      const payload = await this.authService.decodeToken(token);
      const account = await this.accountService.getPromoterAccount(payload.account);

      if (!account) throw new UnauthorizedException('Invalid account');

      return account;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token');
    }
  }
}

@Injectable()
export class AccessPipeService implements PipeTransform {
  constructor(
    private accountService: AccountService,
    private authService: AuthService,
  ) {}

  public async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      const payload = await this.authService.decodeToken(token);
      const account = await this.accountService.getAccessAccount(payload.account);

      if (!account) throw new UnauthorizedException('Invalid account');

      return account;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token');
    }
  }
}
