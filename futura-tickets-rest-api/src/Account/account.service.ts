import { ArgumentMetadata, Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// MONGOOSE
import { DeleteResult, Model, Types } from 'mongoose';

// SCHEMA
import { Account as AccountModel, AccountDocument } from './account.schema';

// UTILS
import { hashPassword } from '../utils/password';

// INTERFACES
import { Account, Roles, CreateAccess } from './account.interface';

@Injectable()
export class AccountService {

  constructor(
    @InjectModel(AccountModel.name) private accountModel: Model<AccountDocument>
  ) {}

  public async deleteAdminAccount(promoter: string, account: string): Promise<DeleteResult> {
    return await this.accountModel.deleteOne({ _id: account, promoter });
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
      accessPass: createAccessAccount.password
    });
    
    return {
      _id: account._id,
      name: account.name,
      lastName: account.lastName,
      role: account.role,
      promoter,
      email: account.email,
      accessEvent: createAccessAccount.event,
      accessPass: createAccessAccount.password
    };

  }

  public async getPromoterAccount(promoter: string): Promise<Account | null> {
    return await this.accountModel.findOne({ _id: promoter, $or: [
      { role: 'ADMIN' },
      { role: 'PROMOTER' }
    ]}).select({ _id: 1, promoter: 1 });
  }

  public async getAdminAccounts(promoter: string): Promise<Account[]> {
    return await this.accountModel.find({ promoter, $or: [{ role: Roles.ADMIN }, { role: Roles.PROMOTER }] }).select({ name: 1, lastName: 1, email: 1, role: 1 }).sort({ createdAt: 'asc' });
  }

  public async getEventAccessAccounts(promoter: string, accessEvent: string): Promise<Account[]> {
    return await this.accountModel.find({ promoter, accessEvent }).select({ name: 1, lastName: 1, email: 1, role: 1, accessEvent: 1, accessPass: 1 }).sort({ createdAt: 'asc' });
  }

  public async getAccessAccount(accountId: string): Promise<Account | null> {
    return await this.accountModel.findOne({ _id: accountId, role: 'ACCESS' }).select({ _id: 1, promoter: 1 });
  }

  public async getAccessAccountByEmail(accountEmail: string): Promise<Account | null> {
    return await this.accountModel.findOne<Account>({ email: accountEmail, role: Roles.ACCESS }).populate({
      path: 'promoter',
      model: 'Promoter',
      select: { name: 1, createdAt: 1 }
    }).populate({
      path: 'accessEvent',
      model: 'Event',
      select: { name: 1, createdAt: 1 }
    });
  }

}