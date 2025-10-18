import { ArgumentMetadata, Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as fastcsv from 'fast-csv';
import { Readable } from 'stream';

// WEB3
import { ethers } from 'ethers';

// MONGOOSE
import { DeleteResult, Model } from 'mongoose';

// SCHEMA
import { Account as AccountModel, AccountDocument } from './account.schema';

// SERVICES
// import { AbstractionService } from '../Abstraction/abstraction.service'; // Temporarily disabled
import { AuthService } from '../Auth/services/auth.service';
import { MailService } from '../Mail/mail.service';

// UTILS
import { comparePassword, generateRandomPassword, hashPassword } from '../utils/password';

// INTERFACES
import {
  Account,
  CreateAccount,
  DecodedToken,
  UpdateAccount,
  GoogleAccount,
  LoginAccount,
  Roles,
  CreateAccess,
  UpdateAdminAccount,
} from './account.interface';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(AccountModel.name)
    private accountModel: Model<AccountDocument>,
    // private abstractionService: AbstractionService, // Temporarily disabled
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  public async createAccount(createAccount: CreateAccount): Promise<Account> {
    const randomWallet = ethers.Wallet.createRandom();
    // Temporarily disabled blockchain integration
    // const smartAddress = await this.abstractionService.getSmartAccountClient(
    //   randomWallet.privateKey as `0x${string}`,
    // );

    const account = await this.accountModel.create({
      name: createAccount.name,
      lastName: createAccount.lastName,
      email: createAccount.email,
      birthdate: createAccount.birthdate,
      phone: createAccount.phone ? createAccount.phone : '',
      address: randomWallet.address,
      smartAddress: undefined, // smartAddress.account?.address, // Temporarily disabled
      mnemonic: randomWallet.mnemonic?.phrase,
      key: randomWallet.privateKey,
      password: await hashPassword(createAccount.password),
      role: createAccount.role,
    });

    return {
      _id: account._id,
      name: account.name,
      lastName: account.lastName,
      role: account.role,
      email: account.email,
      birthdate: account.birthdate,
      address: account.address,
      smartAddress: account.smartAddress,
      token: await this.authService.registerToken({
        account: account._id,
        name: account.name,
        lastName: account.lastName,
        birthdate: account.birthdate,
        role: account.role,
        email: account.email,
        address: account.address,
        smartAddress: account.smartAddress,
      }),
    };
  }

  public async deleteAdminAccount(promoter: string, account: string): Promise<DeleteResult> {
    return await this.accountModel.deleteOne({ _id: account, promoter });
  }

  public async createPromoterAccount(createPromoterAccount: CreateAccount, promoter: string): Promise<Account> {
    const account = await this.accountModel.create({
      name: createPromoterAccount.name,
      lastName: createPromoterAccount.lastName,
      email: createPromoterAccount.email,
      role: createPromoterAccount.role,
      config: {
        notifications: {
          isOrderNotificationsEnabled: true,
          isUserNotificationsEnabled: true,
          isResaleNotificationsEnabled: true,
          isTransferNotificationsEnabled: true,
        },
      },
      promoter,
      password: await hashPassword(createPromoterAccount.password),
    });

    return {
      _id: account._id,
      name: account.name,
      lastName: account.lastName,
      birthdate: account.birthdate,
      role: account.role,
      config: {
        notifications: {
          isOrderNotificationsEnabled: true,
          isUserNotificationsEnabled: true,
          isResaleNotificationsEnabled: true,
          isTransferNotificationsEnabled: true,
        },
      },
      promoter,
      email: account.email,
      token: await this.authService.registerToken({
        account: account._id,
        name: account.name,
        lastName: account.lastName,
        birthdate: account.birthdate,
        role: account.role,
        promoter,
        email: account.email,
      }),
    };
  }

  public async createAccessAccount(createAccessAccount: CreateAccess, promoter: string): Promise<Account> {
    const account = await this.accountModel.create({
      name: createAccessAccount.name,
      lastName: createAccessAccount.lastName,
      email: createAccessAccount.email,
      role: Roles.ACCESS,
      promoter,
      password: await hashPassword(createAccessAccount.password),
      accessEvent: createAccessAccount.event,
      accessPass: createAccessAccount.password,
    });

    return {
      _id: account._id,
      name: account.name,
      lastName: account.lastName,
      role: account.role,
      promoter,
      email: account.email,
      accessEvent: createAccessAccount.event,
      accessPass: createAccessAccount.password,
    };
  }

  public async accountExistOrCreate(
    name: string,
    lastName: string,
    email: string,
    birthdate: Date,
    phone: string,
  ): Promise<Account | null | undefined> {
    try {
      const account = await this.getAccountByEmail(email);
      if (account) return account;

      const password = generateRandomPassword(8);

      const createAccount: CreateAccount = {
        email,
        name,
        lastName,
        birthdate,
        phone,
        password,
        registered: false,
        role: Roles.USER,
      };

      // EMIT NEW USER
      const newAccount = await this.createAccount(createAccount);

      // SECURITY FIX: Send secure password setup email (no plaintext password)
      // Temporarily using direct email send instead of queue
      await this.mailService.sendAccountConfirmation(newAccount);

      return newAccount;
    } catch (error) {
      throw new UnauthorizedException('Error retrieveing your account!');
    }
  }

  public async loginGoogle(googleCode: string): Promise<Account | void> {
    try {
      const googleAccountRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleCode}`);
      const googleAccount = (await googleAccountRes.json()) as GoogleAccount;

      const account = await this.getAccountByEmail(googleAccount.email);

      if (account) {
        return {
          _id: account._id,
          name: account.name,
          lastName: account.lastName,
          email: account.email,
          address: account.address,
          role: Roles.USER,
          token: await this.authService.registerToken({
            account: account._id,
            name: account.name,
            lastName: account.lastName,
            email: account.email,
            address: account.address,
            role: Roles.USER,
          }),
        };
      }

      const createAccount: CreateAccount = {
        email: googleAccount.email,
        name: googleAccount.given_name,
        lastName: googleAccount.family_name,
        password: 'test1234',
        registered: false,
        role: Roles.USER,
      };

      return await this.createAccount(createAccount);
    } catch (error) {}
  }

  public async addOrderToAccount(account: string, order: string): Promise<void> {
    try {
      await this.accountModel.findByIdAndUpdate(account, {
        $push: { orders: order },
      });
    } catch (error) {}
  }

  public async validate(token: string): Promise<DecodedToken> {
    return await this.authService.decodeToken(token);
  }

  public async editAccount(accountId: string, updateAccount: UpdateAccount): Promise<any> {
    return await this.accountModel.updateOne({ _id: accountId }, updateAccount);
  }

  public async editAdminAccount(accountId: string, updateAccount: UpdateAdminAccount): Promise<any> {
    return await this.accountModel.updateOne({ _id: accountId }, updateAccount);
  }

  public async getUserAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel.findById({ _id: accountId, role: 'USER' }).select({ _id: 1 });
  }

  public async getAdminAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel.findById({ _id: accountId, role: 'ADMIN' }).select({ _id: 1, promoter: 1 });
  }

  public async getPromoterAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel
      .findOne({
        _id: accountId,
        $or: [{ role: 'ADMIN' }, { role: 'PROMOTER' }],
      })
      .select({ _id: 1, promoter: 1 });
  }

  public async getAdminAccounts(promoter: string): Promise<Account[]> {
    return await this.accountModel
      .find({
        promoter,
        $or: [{ role: Roles.ADMIN }, { role: Roles.PROMOTER }],
      })
      .select({ name: 1, lastName: 1, email: 1, role: 1 })
      .sort({ createdAt: 'asc' });
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

  public async getAccountPrivateKeyById(account: string): Promise<Account | null> {
    return await this.accountModel.findById(account).select({ _id: 1, name: 1, lastName: 1, address: 1, key: 1 });
  }

  public async getAccountPrivateKey(email: string): Promise<Account | null> {
    return await this.accountModel.findOne({ email }).select({ address: 1, key: 1 });
  }

  public async getAccountPrivateKeyByAddress(address: string): Promise<Account | null> {
    return await this.accountModel.findOne({ address }).select({ address: 1, key: 1 });
  }

  public async getAccountByEmail(accountEmail: string): Promise<Account | null> {
    return await this.accountModel.findOne<Account>({ email: accountEmail }).populate({
      path: 'promoter',
      model: 'Promoter',
      select: { name: 1, image: 1, icon: 1, createdAt: 1, api: 1 },
    });
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

  public async login(loginAccount: LoginAccount): Promise<Account> {
    const account = await this.getAccountByEmail(loginAccount.email);
    if (account && account.registered) {
      // CHECK IF PASSWORD MATCH
      const passwordMatch = await comparePassword(loginAccount.password, account.password);
      if (passwordMatch) {
        return {
          _id: account._id,
          name: account.name,
          lastName: account.lastName,
          birthdate: account.birthdate,
          gender: account.gender,
          config: account.config,
          promoter: account.promoter,
          accessEvent: account.accessEvent,
          role: account.role,
          email: account.email,
          address: account.address,
          smartAddress: account.smartAddress,
          token: await this.authService.registerToken({
            account: account._id,
            name: account.name,
            lastName: account.lastName,
            birthdate: account.birthdate,
            gender: account.gender,
            config: account.config,
            promoter: account.promoter,
            accessEvent: account.accessEvent,
            role: account.role,
            email: account.email,
            address: account.address,
            smartAddress: account.smartAddress,
          }),
        };
      }
      throw new UnauthorizedException('Error Login In!');
    }
    throw new UnauthorizedException('Error Login In!');
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

  public async getAccountByAddress(address: string): Promise<Account | null> {
    return this.accountModel.findOne({ address }).select({ _id: 1, name: 1, lastName: 1, address: 1 });
  }

  public async generateAllClientsCsv() {
    const users = await this.accountModel.find();

    const csvStream = fastcsv.format({ headers: true });

    const dataStream = new Readable({
      objectMode: true,
      read() {},
    });

    users.forEach((user) => {
      dataStream.push({
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        email: user.email,
        phone: user.phone,
        birthdate: user.birthdate,
        registered: user.registered,
        active: user.active,
      });
    });

    dataStream.push(null);

    dataStream.pipe(csvStream);

    return csvStream;
  }

  public async generateAllClientsCsvWithPromoter(promoter: Account) {
    const users = await this.accountModel.find({ promoter: promoter._id }).populate({
      path: 'promoter',
      model: 'Promoter',
      select: {
        _id: 0,
        name: 1,
      },
    });

    const csvStream = fastcsv.format({ headers: true });

    const dataStream = new Readable({
      objectMode: true,
      read() {},
    });

    users.forEach((user) => {
      console.log(user);
      dataStream.push({
        name: user.name,
        lastName: user.lastName,
        promoter: user.promoter ? (user.promoter as unknown as { name: string }).name : ' ',
        role: user.role,
        email: user.email,
        phone: user.phone,
        birthdate: user.birthdate,
        registered: user.registered,
        active: user.active,
      });
    });

    dataStream.push(null);

    dataStream.pipe(csvStream);

    return csvStream;
  }

  public async generateAllClientsCsvByPromoter(promoterId: string) {
    const users = await this.accountModel.find({ promoter: promoterId }).populate({
      path: 'promoter',
      model: 'Promoter',
      select: {
        _id: 0,
        name: 1,
      },
    });

    const csvStream = fastcsv.format({ headers: true });

    const dataStream = new Readable({
      objectMode: true,
      read() {},
    });

    users.forEach((user) => {
      console.log(user);
      dataStream.push({
        name: user.name,
        lastName: user.lastName,
        promoter: user.promoter ? (user.promoter as unknown as { name: string }).name : ' ',
        role: user.role,
        email: user.email,
        phone: user.phone,
        birthdate: user.birthdate,
        registered: user.registered,
        active: user.active,
      });
    });

    dataStream.push(null);

    dataStream.pipe(csvStream);

    return csvStream;
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

@Injectable()
export class AdminPipeService implements PipeTransform {
  constructor(
    private accountService: AccountService,
    private authService: AuthService,
  ) {}

  public async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      const payload = await this.authService.decodeToken(token);
      const account = await this.accountService.getAdminAccount(payload.account);
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
export class UserPipeService implements PipeTransform {
  constructor(
    private accountService: AccountService,
    private authService: AuthService,
  ) {}

  public async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      const payload = await this.authService.decodeToken(token);
      const account = await this.accountService.getUserAccount(payload.account);

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
