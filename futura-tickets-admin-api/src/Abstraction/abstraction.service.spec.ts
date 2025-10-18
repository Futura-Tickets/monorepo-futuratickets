import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AbstractionService } from './abstraction.service';
import { ProviderService } from '../Provider/provider.service';

jest.mock('ethers', () => {
  const actual = jest.requireActual('ethers');
  const walletInstances: any[] = [];

  class WalletMock {
    public address: string;
    public provider: any;
    public sendTransaction = jest
      .fn()
      .mockResolvedValue({ hash: '0xmockhash' });

    constructor(privateKey: string, provider: any) {
      if (!privateKey.startsWith('0x')) {
        throw new Error('Invalid private key');
      }
      this.address = '0xMockAddress';
      this.provider = provider;
      walletInstances.push(this);
    }
  }

  return {
    ...actual,
    Wallet: WalletMock,
    __walletInstances: walletInstances,
  };
});

const { __walletInstances } = require('ethers') as {
  __walletInstances: Array<{ sendTransaction: jest.Mock; provider: any }>;
};

describe('AbstractionService', () => {
  let service: AbstractionService;
  const providerMock = {};
  const providerServiceMock = {
    getProvider: jest.fn().mockReturnValue(providerMock),
  } as unknown as ProviderService;

  const configServiceMock = {
    get: jest.fn((key: string) =>
      key === 'BLOCKCHAIN_RPC_URL' ? 'http://localhost:8545' : undefined,
    ),
  } as unknown as ConfigService;

  beforeEach(async () => {
    __walletInstances.length = 0;
    providerServiceMock.getProvider = jest.fn().mockReturnValue(providerMock);
    (configServiceMock.get as jest.Mock).mockImplementation((key: string) =>
      key === 'BLOCKCHAIN_RPC_URL' ? 'http://localhost:8545' : undefined,
    );

    const moduleRef = await Test.createTestingModule({
      providers: [
        AbstractionService,
        { provide: ProviderService, useValue: providerServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = moduleRef.get(AbstractionService);
  });

  it('creates a smart account client with connected wallet', async () => {
    const client = await service.getSmartAccountClient(
      '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    );

    expect(client.account.address).toBe('0xMockAddress');
    expect(__walletInstances).toHaveLength(1);
    expect(__walletInstances[0].provider).toBe(providerMock);
  });

  it('sends transaction using underlying wallet', async () => {
    const client = await service.getSmartAccountClient(
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    );

    const hash = await service.sendTransaction(
      client,
      '0x0000000000000000000000000000000000000001',
      '0xdeadbeef',
    );

    expect(hash).toBe('0xmockhash');
    expect(__walletInstances[0].sendTransaction).toHaveBeenCalledWith({
      to: '0x0000000000000000000000000000000000000001',
      data: '0xdeadbeef',
      value: 0n,
      gasLimit: 600000n,
    });
  });

  it('throws when provider configuration is missing', async () => {
    (configServiceMock.get as jest.Mock).mockReturnValueOnce(undefined);

    await expect(
      service.getSmartAccountClient(
        '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      ),
    ).rejects.toThrow(/Blockchain provider is not configured/);
  });
});
