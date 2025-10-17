import { Injectable, UnauthorizedException, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

//WEB3
import { ethers } from 'ethers';

// MONGOOSE
import { Model } from 'mongoose';

// SCHEMA
import { Account as AccountModel, AccountDocument } from './account.schema';

// SERVICES
import { AuthService } from 'src/Auth/services/auth.service';
import { MailService } from 'src/Mail/mail.service';

// UTILS
import { hashPassword } from '../utils/password';

// INTERFACES
import { Account, CreateAccount, Roles, GoogleAccount, DecodedToken, LoginAccount, UpdateAccount } from './account.interface';

// UTILS
import { comparePassword, generateRandomPassword } from '../utils/password';

@Injectable()
export class AccountService {

  constructor(
    @InjectModel(AccountModel.name) private accountModel: Model<AccountDocument>,
    private authService: AuthService,
    private mailService: MailService
  ) {}

  public async validate(token: string): Promise<DecodedToken> {
    return await this.authService.decodeToken(token);
  }

  public async createAccount(createAccount: CreateAccount): Promise<Account> {

    const randomWallet = ethers.Wallet.createRandom();

    const account = await this.accountModel.create({
      name: createAccount.name,
      lastName: createAccount.lastName,
      email: createAccount.email,
      phone: createAccount.phone ? createAccount.phone : '',
      birthdate: createAccount.birthdate,
      address: randomWallet.address,
      mnemonic: randomWallet.mnemonic?.phrase,
      key: randomWallet.privateKey,
      password: await hashPassword(createAccount.password),
      role: createAccount.role
    });

    await this.mailService.sendAccountConfirmation(account, createAccount.password);
    
    return {
      _id: account._id,
      name: account.name,
      lastName: account.lastName,
      birthdate: account.birthdate,
      role: account.role,
      email: account.email,
      address: account.address,
      token: await this.authService.registerToken({
        account: account._id,
        name: account.name,
        lastName: account.lastName,
        role: account.role,
        email: account.email,
        address: account.address,
      }),
    };

  }

  public async getAccountById(accountId: string): Promise<Account | null> {
    return await this.accountModel.findOne({ _id: accountId }).lean();
  }

  public async getAccessAccountByEmail(
    accountEmail: string,
  ): Promise<Account | null> {
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

  public async userLogin(loginAccount: LoginAccount): Promise<Account> {
    const account = await this.getAccountByEmail(loginAccount.email);
    if (account && account.registered) {
      // CHECK IF PASSWORD MATCH
      const passwordMatch = await comparePassword(
        loginAccount.password,
        account.password,
      );
      if (passwordMatch) {
        return {
          _id: account._id,
          name: account.name,
          lastName: account.lastName,
          birthdate: account.birthdate,
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

  public async loginGoogle(googleCode: string): Promise<Account | void> {
    try {

      const googleAccountRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleCode}`);
      const googleAccount = await googleAccountRes.json() as GoogleAccount;
      const account = await this.getAccountByEmail(googleAccount.email);

      if (account) {

        return {
          _id: account._id,
          name: account.name,
          lastName: account.lastName,
          birthdate: account.birthdate,
          email: account.email,
          address: account.address,
          role: Roles.USER,
          token: await this.authService.registerToken({
            account: account._id,
            name: account.name,
            lastName: account.lastName,
            email: account.email,
            address: account.address,
            role: Roles.USER
          }),
        };

      }

      const createAccount: CreateAccount = {
        email: googleAccount.email,
        name: googleAccount.given_name,
        lastName: googleAccount.family_name,
        birthdate:googleAccount.birthday,
        password: 'test1234',
        registered: false,
        role: Roles.USER
      };
   
      return await this.createAccount(createAccount);
      
    } catch (error) {
      
    }
  };

  public async getAccountByEmail(accountEmail: string): Promise<Account | null> {
    return await this.accountModel.findOne<Account>({ email: accountEmail }).populate({
      path: 'promoter',
      model: 'Promoter',
      select: { name: 1, image: 1, icon: 1, createdAt: 1 }
    });
  }


  public async accountExistOrCreate(name: string, lastName: string, email: string, birthdate: Date,phone: string): Promise<Account | null | undefined> {
    try {
      
      const account = await this.getAccountByEmail(email);
      if (account) return account;

      const createAccount: CreateAccount = {
        email,
        name,
        lastName,
        phone,
        birthdate,
        password: generateRandomPassword(8),
        registered: false,
        role: Roles.USER
      };

      return await this.createAccount(createAccount);

    } catch (error) {
      throw new UnauthorizedException('Error retrieveing your account!');
    }
  }

  public async addOrderToAccount(account: string, order: string): Promise<void> {
    try {
      await this.accountModel.findByIdAndUpdate(account, { $push: { orders: order }});
    } catch (error) {
      
    }
  }

  public async getUserAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel.findById({ _id: accountId, role: 'USER' })
    .select({ _id: 1 });
  }

  public async getUserInfo(accountId: string): Promise<Account | null> {
    return await this.accountModel.findById({ _id: accountId, role: 'USER' })
    .select({ role: 0, registered: 0, mnemonic: 0, active: 0, password: 0, __v: 0, key: 0 })
    .populate({
      path: 'orders',
      model: 'Orders',
      select: {
        _id: 0
      },
      populate: {
        path: 'sales',
        model: 'Sales',
        select: {
          _id: 0
        },
        populate: {
          path: 'event',
          model: 'Event',
          select: {
            orders: 0,
            __v: 0,
            blockNumber: 0,
            hash: 0,
            isBlockchain: 0
          }
        }
      }
    });
  }

  public async getPromoterAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel.findOne({ _id: accountId, $or: [
      { role: 'ADMIN' },
      { role: 'PROMOTER' }
    ]}).select({ _id: 1, promoter: 1 });
  }

  public async getAccountPrivateKeyById(account: string): Promise<Account | null> {
    return await this.accountModel.findById(account).select({ _id: 1, name: 1, lastName: 1, address: 1, key: 1 });
  }

  public async getAccessAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel.findOne({ _id: accountId, role: 'ACCESS' }).select({ _id: 1, promoter: 1 });
  }

  public async updateAccountPassword(user: Account, currentPassword: string, newPassword: string): Promise<Account | null> {
    const account = await this.getAccountById(user._id);
    try {
      if (await comparePassword(currentPassword, account!.password)) {
        const updatedAccount = await this.accountModel.findOneAndUpdate({ _id: account!._id }, { password: await hashPassword(newPassword) });
        return updatedAccount;
      } else {
        console.log('Current password is incorrect');
        return account;
      }
    } catch (error) {
      console.log(error);
      console.log('There was an error updating your password');
      return account;
    }
  }

  public async updateAccountInfo(account: Account, newInfo: UpdateAccount): Promise<Account | null> {
    try {
      const updateData = Object.entries(newInfo) // Exclude fields defined as undefined in newInfo
      .filter(([_, value]) => value !== undefined)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      const updatedAccount = await this.accountModel.findOneAndUpdate(
        { _id: account._id },
        { $set: updateData },
        { new: true }
      );

      return updatedAccount;

    } catch (error) {
      console.log('There was an error updating your account');
      return account;
    }
  }

  public async accountRecoveryMail(email: string) {
    try {
      const account = await this.getAccountByEmail(email);
      if (!account) {
        console.log('Account not found');
      } else {
        return await this.mailService.sendRecoverAccount(account);
      }
    } catch (error) {
      console.log('There was an error sending the recovery email');
    }
  }

  public async passwordRecovery(user: Account, newPassword: string): Promise<boolean> {
    try {
      const account = await this.getAccountById(user._id);
      if (!account) {
        console.log('Account not found');
        return false;
      }

      await this.accountModel.findOneAndUpdate(
        { _id: account._id },
        { password: await hashPassword(newPassword) }
      );

      return true;

    } catch (error) {
      console.log('There was an error updating your password');
      return false;
    }
  }

}

@Injectable()
export class UserPipeService implements PipeTransform {

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
  ) {}

  public async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      
      const payload = await this.authService.decodeToken(token);
      const account = await this.accountService.getUserAccount(payload.account);

      if (!account) throw new UnauthorizedException("Invalid account");

      return account;

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Token");
    }
  }

}