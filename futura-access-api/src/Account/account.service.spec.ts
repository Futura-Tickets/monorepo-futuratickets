import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException } from '@nestjs/common';
import { AccountService, PromoterPipeService, AccessPipeService } from './account.service';
import { Account as AccountModel } from './account.schema';
import { AuthService } from '../Auth/services/auth.service';
import {
  MockAccountFactory,
  MockAuthFactory,
  mockRepository,
  mockService,
} from '../../test/utils/test-setup';
import * as passwordUtils from '../utils/password';

describe('AccountService', () => {
  let service: AccountService;
  let accountModel: any;
  let authService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: getModelToken(AccountModel.name),
          useValue: mockRepository(),
        },
        {
          provide: AuthService,
          useValue: mockService(['decodeToken', 'registerToken']),
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    accountModel = module.get(getModelToken(AccountModel.name));
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    it('should validate and decode a token', async () => {
      const mockPayload = MockAuthFactory.createJwtPayload();
      authService.decodeToken.mockResolvedValue(mockPayload);

      const result = await service.validate('valid.jwt.token');

      expect(result).toEqual(mockPayload);
      expect(authService.decodeToken).toHaveBeenCalledWith('valid.jwt.token');
    });

    it('should throw error if token is invalid', async () => {
      authService.decodeToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.validate('invalid.token')).rejects.toThrow('Invalid token');
    });
  });

  describe('getEventAccessAccounts', () => {
    it('should return access accounts for a specific event', async () => {
      const mockAccounts = [
        MockAccountFactory.createAccessAccount({
          promoter: 'promoter123',
          accessEvent: 'event123',
        }),
        MockAccountFactory.createAccessAccount({
          promoter: 'promoter123',
          accessEvent: 'event123',
        }),
      ];

      accountModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockAccounts),
        }),
      });

      const result = await service.getEventAccessAccounts('promoter123', 'event123');

      expect(result).toEqual(mockAccounts);
      expect(accountModel.find).toHaveBeenCalledWith({
        promoter: 'promoter123',
        accessEvent: 'event123',
      });
    });

    it('should return empty array if no accounts found', async () => {
      accountModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getEventAccessAccounts('promoter999', 'event999');

      expect(result).toEqual([]);
    });
  });

  describe('getPromoterAccount', () => {
    it('should return account if role is PROMOTER', async () => {
      const mockAccount = MockAccountFactory.createPromoterAccount();
      accountModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await service.getPromoterAccount(mockAccount._id);

      expect(result).toEqual(mockAccount);
      expect(accountModel.findOne).toHaveBeenCalledWith({
        _id: mockAccount._id,
        $or: [{ role: 'ADMIN' }, { role: 'PROMOTER' }],
      });
    });

    it('should return account if role is ADMIN', async () => {
      const mockAccount = MockAccountFactory.createAdminAccount();
      accountModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await service.getPromoterAccount(mockAccount._id);

      expect(result).toEqual(mockAccount);
    });

    it('should return null if account not found or invalid role', async () => {
      accountModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getPromoterAccount('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAccessAccount', () => {
    it('should return account with ACCESS role', async () => {
      const mockAccount = MockAccountFactory.createAccessAccount();
      accountModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await service.getAccessAccount(mockAccount._id);

      expect(result).toEqual(mockAccount);
      expect(accountModel.findOne).toHaveBeenCalledWith({
        _id: mockAccount._id,
        role: 'ACCESS',
      });
    });

    it('should return null if account not found', async () => {
      accountModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getAccessAccount('invalid_id');

      expect(result).toBeNull();
    });
  });

  describe('getAccessAccountByEmail', () => {
    it('should return populated access account', async () => {
      const mockAccount = MockAccountFactory.createAccessAccount({
        email: 'access@test.com',
      });

      accountModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockAccount),
        }),
      });

      const result = await service.getAccessAccountByEmail('access@test.com');

      expect(result).toEqual(mockAccount);
      expect(accountModel.findOne).toHaveBeenCalledWith({
        email: 'access@test.com',
        role: 'ACCESS',
      });
    });
  });

  describe('accessLogin', () => {
    it('should successfully login with valid credentials', async () => {
      const mockAccount = MockAccountFactory.createAccessAccount({
        email: 'access@test.com',
        password: '$2a$10$hashedpassword',
        registered: true,
      }) as any;

      const mockToken = MockAuthFactory.createMockToken();

      jest.spyOn(service, 'getAccessAccountByEmail').mockResolvedValue(mockAccount);
      jest.spyOn(passwordUtils, 'comparePassword').mockResolvedValue(true);
      authService.registerToken.mockResolvedValue(mockToken);

      const loginData = {
        email: 'access@test.com',
        password: 'correctpassword',
      };

      const result = await service.accessLogin(loginData);

      expect(result).toMatchObject({
        _id: mockAccount._id,
        name: mockAccount.name,
        lastName: mockAccount.lastName,
        email: mockAccount.email,
        role: mockAccount.role,
        token: mockToken,
      });

      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        'correctpassword',
        '$2a$10$hashedpassword',
      );
      expect(authService.registerToken).toHaveBeenCalledWith({
        account: mockAccount._id,
        name: mockAccount.name,
        lastName: mockAccount.lastName,
        promoter: mockAccount.promoter,
        accessEvent: mockAccount.accessEvent,
        role: mockAccount.role,
        email: mockAccount.email,
        address: mockAccount.address,
      });
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const mockAccount = MockAccountFactory.createAccessAccount({
        email: 'access@test.com',
        registered: true,
      }) as any;

      jest.spyOn(service, 'getAccessAccountByEmail').mockResolvedValue(mockAccount);
      jest.spyOn(passwordUtils, 'comparePassword').mockResolvedValue(false);

      const loginData = {
        email: 'access@test.com',
        password: 'wrongpassword',
      };

      await expect(service.accessLogin(loginData)).rejects.toThrow(UnauthorizedException);
      await expect(service.accessLogin(loginData)).rejects.toThrow('Error Login In!');
    });

    it('should throw UnauthorizedException if account not found', async () => {
      jest.spyOn(service, 'getAccessAccountByEmail').mockResolvedValue(null);

      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password',
      };

      await expect(service.accessLogin(loginData)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if account is not registered', async () => {
      const mockAccount = MockAccountFactory.createAccessAccount({
        email: 'access@test.com',
        registered: false,
      }) as any;

      jest.spyOn(service, 'getAccessAccountByEmail').mockResolvedValue(mockAccount);

      const loginData = {
        email: 'access@test.com',
        password: 'password',
      };

      await expect(service.accessLogin(loginData)).rejects.toThrow(UnauthorizedException);
    });
  });
});

describe('PromoterPipeService', () => {
  let pipe: PromoterPipeService;
  let accountService: AccountService;
  let authService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromoterPipeService,
        {
          provide: AccountService,
          useValue: mockService(['getPromoterAccount']),
        },
        {
          provide: AuthService,
          useValue: mockService(['decodeToken']),
        },
      ],
    }).compile();

    pipe = module.get<PromoterPipeService>(PromoterPipeService);
    accountService = module.get<AccountService>(AccountService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should return account if token is valid and user is PROMOTER', async () => {
    const mockPayload = MockAuthFactory.createJwtPayload({ role: 'PROMOTER' });
    const mockAccount = MockAccountFactory.createPromoterAccount();

    authService.decodeToken.mockResolvedValue(mockPayload);
    (accountService.getPromoterAccount as jest.Mock).mockResolvedValue(mockAccount);

    const result = await pipe.transform('valid.token', {} as any);

    expect(result).toEqual(mockAccount);
    expect(authService.decodeToken).toHaveBeenCalledWith('valid.token');
    expect(accountService.getPromoterAccount).toHaveBeenCalledWith(mockPayload.account);
  });

  it('should throw UnauthorizedException if account not found', async () => {
    const mockPayload = MockAuthFactory.createJwtPayload();

    authService.decodeToken.mockResolvedValue(mockPayload);
    (accountService.getPromoterAccount as jest.Mock).mockResolvedValue(null);

    await expect(pipe.transform('valid.token', {} as any)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(pipe.transform('valid.token', {} as any)).rejects.toThrow('Invalid account');
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    authService.decodeToken.mockRejectedValue(new Error('Invalid token'));

    await expect(pipe.transform('invalid.token', {} as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

describe('AccessPipeService', () => {
  let pipe: AccessPipeService;
  let accountService: AccountService;
  let authService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessPipeService,
        {
          provide: AccountService,
          useValue: mockService(['getAccessAccount']),
        },
        {
          provide: AuthService,
          useValue: mockService(['decodeToken']),
        },
      ],
    }).compile();

    pipe = module.get<AccessPipeService>(AccessPipeService);
    accountService = module.get<AccountService>(AccountService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should return account if token is valid and user is ACCESS', async () => {
    const mockPayload = MockAuthFactory.createAccessJwtPayload();
    const mockAccount = MockAccountFactory.createAccessAccount();

    authService.decodeToken.mockResolvedValue(mockPayload);
    (accountService.getAccessAccount as jest.Mock).mockResolvedValue(mockAccount);

    const result = await pipe.transform('valid.token', {} as any);

    expect(result).toEqual(mockAccount);
    expect(authService.decodeToken).toHaveBeenCalledWith('valid.token');
    expect(accountService.getAccessAccount).toHaveBeenCalledWith(mockPayload.account);
  });

  it('should throw UnauthorizedException if account not found', async () => {
    const mockPayload = MockAuthFactory.createAccessJwtPayload();

    authService.decodeToken.mockResolvedValue(mockPayload);
    (accountService.getAccessAccount as jest.Mock).mockResolvedValue(null);

    await expect(pipe.transform('valid.token', {} as any)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(pipe.transform('valid.token', {} as any)).rejects.toThrow('Invalid account');
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    authService.decodeToken.mockRejectedValue(new Error('Invalid token'));

    await expect(pipe.transform('invalid.token', {} as any)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
