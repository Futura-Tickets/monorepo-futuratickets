# GUÍA DE INTEGRACIÓN BLOCKCHAIN - FUTURATICKETS

> **Autor**: Claude Code
> **Fecha**: 2025-10-15
> **Estado**: En Implementación
> **Versión**: 1.0.0

---

## TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Trabajo Completado](#3-trabajo-completado)
4. [Integración Pendiente](#4-integración-pendiente)
5. [Flujo de Compra con Blockchain](#5-flujo-de-compra-con-blockchain)
6. [Configuración Requerida](#6-configuración-requerida)
7. [Testing y Deployment](#7-testing-y-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. RESUMEN EJECUTIVO

### Objetivo

Integrar completamente la funcionalidad de blockchain (NFT tickets) en el flujo de compra de FuturaTickets utilizando:
- **Smart Contracts**: FuturaEvent.sol + FuturaEventFactory.sol en Base Sepolia
- **Account Abstraction**: ERC-4337 con Pimlico para experiencia sin gas
- **Event Listeners**: Sincronización automática blockchain ↔ MongoDB

### Estado Actual

**✅ Completado (80%)**:
- Smart contracts seguros y testeados
- Setup de Hardhat completo
- AbstractionService implementado
- BlockchainService para event listeners
- Schemas actualizados (Account, Order)

**⏳ Pendiente (20%)**:
- Integración en flujo de compra (admin-event.service.ts)
- Configuración de env variables
- Deployment a testnet
- Testing end-to-end

---

## 2. ARQUITECTURA DEL SISTEMA

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND                            │
│         (futura-tickets-web + futura-market)            │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼ HTTP REST
┌─────────────────────────────────────────────────────────┐
│                BACKEND API LAYER                        │
│           (futura-tickets-admin-api)                    │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  admin-event.service.ts                       │    │
│  │  - createOrder(paymentId)                     │    │
│  │  - mintTicket(ticketData) [NEW]               │    │
│  └────────────┬──────────────────────────────────┘    │
│               │                                         │
│               │ calls                                   │
│               ▼                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  AbstractionService                           │    │
│  │  - getSmartAccountClient(privateKey)          │    │
│  │  - sendTransaction(...)                       │    │
│  │  - getSmartAccountAddress(...)                │    │
│  └────────────┬──────────────────────────────────┘    │
│               │                                         │
└───────────────┼─────────────────────────────────────────┘
                │
                ▼ viem/ethers
┌─────────────────────────────────────────────────────────┐
│              BLOCKCHAIN LAYER                           │
│              (Base Sepolia Testnet)                     │
│                                                         │
│  ┌────────────────────────────────────────┐           │
│  │   FuturaEventFactory.sol               │           │
│  │   Address: 0x... (deployed once)       │           │
│  └──────────┬─────────────────────────────┘           │
│             │ creates                                  │
│             ▼                                          │
│  ┌────────────────────────────────────────┐           │
│  │   FuturaEvent.sol (per event)          │           │
│  │   - mintNFT()                          │           │
│  │   - setNFTPrice()                      │           │
│  │   - transferNFT()                      │           │
│  │   - Events: TokenMinted, TokenPriced   │           │
│  └────────────────────────────────────────┘           │
│                                                         │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ events via WebSocket
                    ▼
┌─────────────────────────────────────────────────────────┐
│         EVENT LISTENER SERVICE                          │
│                                                         │
│  ┌───────────────────────────────────────────────┐    │
│  │  BlockchainService                            │    │
│  │  - onFuturaEventCreated(address)              │    │
│  │  - onTokenMinted(tokenId)                     │    │
│  │  - Syncs with MongoDB                         │    │
│  └────────────┬──────────────────────────────────┘    │
│               │                                         │
└───────────────┼─────────────────────────────────────────┘
                │
                ▼ updates
┌─────────────────────────────────────────────────────────┐
│              MONGODB DATABASE                           │
│                                                         │
│  Events Collection:                                     │
│    - address (contract address)                        │
│    - blockNumber                                       │
│                                                         │
│  Orders Collection:                                     │
│    - blockchain: {                                     │
│        tokenId, contractAddress,                       │
│        transactionHash, confirmed                      │
│      }                                                  │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **User compra ticket** → Stripe payment
2. **Webhook Stripe** → `handleStripeEvent()`
3. **Bull Queue** → `createOrderQueue.add(paymentId)`
4. **Processor** → `adminEventService.createOrder(paymentId)`
5. **Mint NFT** → `abstractionService.sendTransaction()` → Blockchain
6. **Event Emitted** → `TokenMinted(client, timestamp, tokenId)`
7. **Listener Catches** → `blockchainService.handleTokenMinted()`
8. **DB Updated** → Order.blockchain.tokenId = X

---

## 3. TRABAJO COMPLETADO

### 3.1 Smart Contracts (✅ 100%)

**Archivo**: `futura-tickets-contracts-v2/FuturaEvent.sol` (298 líneas)

**Mejoras implementadas**:
- ✅ ReentrancyGuard para seguridad
- ✅ Pausable para emergencias
- ✅ ERC2981 para royalties estándar
- ✅ maxSupply constraint
- ✅ Batch minting
- ✅ cancelResale() corregido (no borra datos)
- ✅ Validación de transiciones de estado
- ✅ NatSpec completo

**Funciones clave**:
```solidity
function mintNFT(
    uint256 price,
    address client,
    uint256 royaltyPercentage,
    uint256 timeStamp,
    TicketStatus status
) external onlyOwner whenNotPaused nonReentrant returns (uint256)

function batchMintNFT(
    MintParams[] calldata params
) external onlyOwner whenNotPaused returns (uint256[] memory)
```

**Eventos**:
```solidity
event TokenMinted(address indexed client, uint256 indexed timeStamp, uint256 indexed tokenId);
event TokenPriced(uint256 indexed tokenId, uint256 indexed price, TicketStatus indexed status);
event ResaleCancelled(uint256 indexed tokenId);
event TokenStatusChanged(uint256 indexed tokenId, TicketStatus indexed oldStatus, TicketStatus indexed newStatus);
```

### 3.2 Hardhat Setup (✅ 100%)

**Archivos creados**:
- `package.json` con dependencias
- `hardhat.config.ts` con Base Sepolia + Mainnet
- `tsconfig.json`
- `.env.example`
- `.solhint.json` + `.prettierrc.json`
- `.gitignore`

**Scripts disponibles**:
```bash
npm run compile          # Compilar contratos
npm run deploy:baseSepolia    # Deploy a testnet
npm run deploy:base      # Deploy a mainnet
npm run test             # Ejecutar tests
npm run test:coverage    # Coverage report
npm run verify:baseSepolia    # Verificar en Basescan
```

### 3.3 Tests (✅ 100%)

**Archivo**: `test/FuturaEvent.test.ts` (270 líneas)

**Cobertura**:
- ✅ Deployment y configuración inicial
- ✅ Minting (normal, max supply, permisos)
- ✅ Resale (precio, cancelación)
- ✅ Transfer (válidos, inválidos)
- ✅ Ticket status (transiciones)
- ✅ Pause/unpause
- ✅ ERC2981 royalties

**Ejecutar tests**:
```bash
cd futura-tickets-contracts-v2
npm install
npx hardhat test
```

### 3.4 Deployment Scripts (✅ 100%)

**Factory Deployment**: `deploy/01_deploy_factory.ts`
- Deploys FuturaEventFactory
- Auto-verification en Basescan
- Guarda address en deployments/

**Event Creation**: `scripts/create-event.ts`
- Crea nuevo evento vía Factory
- Parsea FuturaEventCreated event
- Retorna contract address

### 3.5 AbstractionService (✅ 100%)

**Archivo**: `futura-tickets-admin-api/src/Abstraction/abstraction.service.ts` (237 líneas)

**Funcionalidades**:
```typescript
// Crear Smart Account Client
async getSmartAccountClient(privateKey: `0x${string}`): Promise<SmartAccountClient>

// Enviar transacción con Account Abstraction
async sendTransaction(
  smartAccountClient: SmartAccountClient,
  to: `0x${string}`,
  callData: `0x${string}`
): Promise<Hash>

// Fallback: EOA transaction
async sendTransactionEOA(
  privateKey: `0x${string}`,
  to: `0x${string}`,
  callData: `0x${string}`
): Promise<Hash>

// Obtener Smart Account address
async getSmartAccountAddress(privateKey: `0x${string}`): Promise<`0x${string}`>

// Verificar deployment
async isSmartAccountDeployed(address: `0x${string}`): Promise<boolean>
```

**Integración**:
- ✅ Pimlico bundler + paymaster
- ✅ Simple Account (ERC-4337)
- ✅ Gas sponsorship opcional
- ✅ Base Sepolia chain

### 3.6 BlockchainService (✅ 100%)

**Archivo**: `futura-tickets-admin-api/src/Blockchain/blockchain.service.ts` (295 líneas)

**Funcionalidades**:
```typescript
// Lifecycle hooks
async onModuleInit()  // Start listeners
async onModuleDestroy()  // Stop listeners

// Event handlers
private async handleFuturaEventCreated(logs: Log[])
private async handleTokenMinted(logs: Log[], contractAddress: string)

// Manual sync
async syncEventRange(fromBlock: bigint, toBlock: bigint)

// Status check
getStatus(): { isListening: boolean, factoryAddress: string, activeWatchers: number }
```

**Eventos escuchados**:
- `FuturaEventCreated(uint256 eventId, address contractAddress, address owner, string eventName, uint256 maxSupply)`
- `TokenMinted(address client, uint256 timeStamp, uint256 tokenId)`

**Acciones automáticas**:
1. **FuturaEventCreated** → Actualiza Event.address en MongoDB
2. **TokenMinted** → Actualiza Order.blockchain.tokenId en MongoDB

### 3.7 Schemas Actualizados (✅ 100%)

**Account Schema**:
```typescript
@Prop()
address: string;  // EOA address

@Prop()
smartAddress: string;  // Smart Account address (AA)

@Prop()
key: string;  // Encrypted private key

@Prop()
mnemonic: string;  // Encrypted mnemonic

@Prop()
walletAddress: string;  // Derived wallet address

@Prop({ default: false })
isBlockchainEnabled: boolean;
```

**Order Schema**:
```typescript
@Prop({ type: Object })
blockchain: BlockchainInfo;

interface BlockchainInfo {
  tokenId?: number;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  confirmed: boolean;
  expectedTimestamp: number;  // Para matching con eventos
}
```

---

## 4. INTEGRACIÓN PENDIENTE

### 4.1 Modificar admin-event.service.ts

**Ubicación**: `futura-tickets-admin-api/src/Event/admin-event.service.ts`

**Método a modificar**: `mintTicket(mintTicket: MintTicket)`

**Cambios necesarios**:

```typescript
// ANTES (simplificado)
async mintTicket(mintTicket: MintTicket): Promise<void> {
  // 1. Obtener event
  const event = await this.eventModel.findById(mintTicket.event);

  // 2. Crear sale en MongoDB
  const sale = await this.salesService.createSale(...);

  // 3. Generar QR code
  const qrCode = await QRCode.toDataURL(...);

  // 4. Actualizar sale con QR
  await this.salesService.updateSale(sale._id, { qrCode });

  // 5. Emitir socket event
  this.socketService.emit(...);
}

// DESPUÉS (con blockchain)
async mintTicket(mintTicket: MintTicket): Promise<void> {
  const event = await this.eventModel.findById(mintTicket.event);

  // Check if blockchain enabled
  if (event.isBlockchain && event.address) {
    try {
      // 1. Get/create user wallet
      let userAccount = await this.accountModel.findById(mintTicket.client);

      if (!userAccount.walletAddress) {
        // Generate wallet for user
        const wallet = ethers.Wallet.createRandom();
        userAccount.walletAddress = wallet.address;
        userAccount.key = await encrypt(wallet.privateKey);  // encrypt!
        userAccount.mnemonic = await encrypt(wallet.mnemonic.phrase);
        await userAccount.save();
      }

      // 2. Get Smart Account Client
      const privateKey = await decrypt(userAccount.key);
      const smartAccountClient = await this.abstractionService.getSmartAccountClient(
        privateKey as `0x${string}`
      );

      // 3. Get Smart Account address
      const smartAddress = smartAccountClient.account.address;

      if (!userAccount.smartAddress) {
        userAccount.smartAddress = smartAddress;
        await userAccount.save();
      }

      // 4. Encode mintNFT call
      const eventContract = new ethers.Contract(
        event.address,
        FuturaEventABI,
        ethers.getDefaultProvider()
      );

      const callData = eventContract.interface.encodeFunctionData('mintNFT', [
        ethers.parseEther(mintTicket.price.toString()),
        smartAddress,  // mint to Smart Account
        5,  // 5% royalty
        mintTicket.timeStamp,
        0   // TicketStatus.OPEN
      ]);

      // 5. Send transaction via Account Abstraction
      const txHash = await this.abstractionService.sendTransaction(
        smartAccountClient,
        event.address as `0x${string}`,
        callData as `0x${string}`
      );

      console.log(`✅ NFT minted! TX: ${txHash}`);

      // 6. Create sale with blockchain info
      const sale = await this.salesService.createSale({
        ...mintTicket,
        blockchain: {
          transactionHash: txHash,
          contractAddress: event.address,
          confirmed: false,
          expectedTimestamp: mintTicket.timeStamp,
        }
      });

      // Note: tokenId will be filled by BlockchainService when event is caught

    } catch (error) {
      console.error('❌ Blockchain mint failed:', error);
      // Fallback: create sale without blockchain
    }
  }

  // Continue with QR generation, etc.
  const sale = await this.salesService.createSale(...);
  const qrCode = await QRCode.toDataURL(...);
  await this.salesService.updateSale(sale._id, { qrCode });
  this.socketService.emit(...);
}
```

### 4.2 Agregar Wallet Management

**Nuevo servicio**: `futura-tickets-admin-api/src/Wallet/wallet.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

@Injectable()
export class WalletService {
  private encryptionKey: string;

  constructor(private configService: ConfigService) {
    this.encryptionKey = this.configService.get<string>('WALLET_ENCRYPTION_KEY')!;
  }

  /**
   * Genera un nuevo wallet EOA
   */
  generateWallet(): { address: string; privateKey: string; mnemonic: string } {
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase,
    };
  }

  /**
   * Encripta una private key
   */
  async encryptPrivateKey(privateKey: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Desencripta una private key
   */
  async decryptPrivateKey(encryptedKey: string): Promise<string> {
    const parts = encryptedKey.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.encryptionKey, 'hex'),
      iv
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Obtiene o crea wallet para un usuario
   */
  async getOrCreateUserWallet(userId: string): Promise<{
    address: string;
    smartAddress?: string;
    privateKey: string;  // Encrypted
  }> {
    const account = await this.accountModel.findById(userId);

    if (!account.walletAddress) {
      const wallet = this.generateWallet();
      account.walletAddress = wallet.address;
      account.key = await this.encryptPrivateKey(wallet.privateKey);
      account.mnemonic = await this.encryptPrivateKey(wallet.mnemonic);
      await account.save();
    }

    return {
      address: account.walletAddress,
      smartAddress: account.smartAddress,
      privateKey: account.key,
    };
  }
}
```

### 4.3 Actualizar Sales Schema

**Archivo**: `futura-tickets-admin-api/src/Sales/sales.schema.ts`

**Agregar campo**:
```typescript
@Prop({ type: Object })
blockchain: {
  tokenId?: number;
  contractAddress?: string;
  transactionHash?: string;
  blockNumber?: number;
  confirmed?: boolean;
};
```

### 4.4 Importar Blockchain Module

**Archivo**: `futura-tickets-admin-api/src/Event/event.module.ts`

```typescript
import { BlockchainModule } from '../Blockchain/blockchain.module';
import { AbstractionModule } from '../Abstraction/abstraction.module';

@Module({
  imports: [
    // ... existing imports
    BlockchainModule,
    AbstractionModule,
  ],
  // ...
})
export class EventModule {}
```

---

## 5. FLUJO DE COMPRA CON BLOCKCHAIN

### Diagrama de Secuencia

```
USER        FRONTEND    BACKEND         STRIPE      BLOCKCHAIN      LISTENER
  │             │           │              │             │             │
  │─Purchase────>│           │              │             │             │
  │             │           │              │             │             │
  │             │─POST──────>│              │             │             │
  │             │  /orders  │              │             │             │
  │             │           │              │             │             │
  │             │           │─PaymentIntent>│             │             │
  │             │           │              │             │             │
  │             │<──────────┤              │             │             │
  │<────────────┤clientSecret              │             │             │
  │             │           │              │             │             │
  │─────────────────────────────────────────────────────>│             │
  │                    Pay with card                     │             │
  │                                                       │             │
  │             │           │<─Webhook─────┤             │             │
  │             │           │  succeeded   │             │             │
  │             │           │              │             │             │
  │             │           │─Queue────────┐             │             │
  │             │           │              │             │             │
  │             │           │<─Process─────┘             │             │
  │             │           │  createOrder               │             │
  │             │           │              │             │             │
  │             │           │─getOrCreateWallet()        │             │
  │             │           │              │             │             │
  │             │           │─getSmartAccountClient()    │             │
  │             │           │              │             │             │
  │             │           │─────────────────mintNFT────>│             │
  │             │           │              │             │             │
  │             │           │              │          [Mint]           │
  │             │           │              │             │             │
  │             │           │              │          emit TokenMinted │
  │             │           │              │             │─────────────>│
  │             │           │              │             │             │
  │             │           │              │             │  ┌──────────┤
  │             │           │              │             │  │ Update DB│
  │             │           │              │             │  │ tokenId  │
  │             │           │              │             │  └──────────>│
  │             │           │              │             │             │
  │             │           │<─────────────────txHash────┤             │
  │             │           │              │             │             │
  │             │           │─Create Sale with           │             │
  │             │           │  blockchain info           │             │
  │             │           │              │             │             │
  │             │           │─Generate QR                │             │
  │             │           │              │             │             │
  │             │           │─Send Email                 │             │
  │             │           │              │             │             │
  │             │<──────────┤              │             │             │
  │<────────────┤  Success  │              │             │             │
  │             │           │              │             │             │
```

### Pasos Detallados

**1. Usuario inicia compra**
   - Selecciona tickets en frontend
   - Click "Comprar"

**2. Frontend crea PaymentIntent**
   - `POST /orders/create`
   - Body: `{ event, items, contactDetails }`
   - Respuesta: `{ clientSecret, orderId }`

**3. Usuario paga con Stripe**
   - Stripe Elements procesa tarjeta
   - PaymentIntent → `succeeded`

**4. Webhook recibido**
   - `POST /admin/events/webhook`
   - Verifica firma
   - Añade a cola: `createOrderQueue.add({ paymentId })`

**5. Processor procesa orden**
   - `CreateTicketProcessor.transcode()`
   - Llama a `adminEventService.createOrder(paymentId)`

**6. createOrder() ejecuta**
   ```typescript
   // a. Obtener órdenes por paymentId
   const orders = await this.ordersService.getOrdersByPaymentId(paymentId);

   // b. Para cada orden
   for (const order of orders) {
     const event = order.event;

     // c. Para cada item en orden
     for (const item of order.items) {
       for (let i = 0; i < item.amount; i++) {
         const ticketData = {
           event: event._id,
           client: order.account._id,
           type: item.type,
           price: item.price,
           timeStamp: Date.now(),
         };

         // d. Añadir a cola de mint
         await this.addMintTicketQueue(ticketData);
       }
     }
   }
   ```

**7. mintTicket() ejecuta (MODIFICADO)**
   ```typescript
   // a. Verificar si evento usa blockchain
   if (event.isBlockchain && event.address) {
     // b. Obtener/crear wallet del usuario
     const wallet = await walletService.getOrCreateUserWallet(clientId);

     // c. Get Smart Account Client
     const client = await abstractionService.getSmartAccountClient(wallet.privateKey);

     // d. Encode mintNFT call
     const callData = encodeFunction('mintNFT', [...params]);

     // e. Send transaction
     const txHash = await abstractionService.sendTransaction(client, eventAddress, callData);

     // f. Create sale with blockchain info
     await salesService.create({
       ...ticketData,
       blockchain: {
         transactionHash: txHash,
         contractAddress: event.address,
         confirmed: false,
         expectedTimestamp: ticketData.timeStamp,
       }
     });
   }
   ```

**8. Blockchain procesa transacción**
   - Bundler ejecuta UserOperation
   - Paymaster sponsorea gas (opcional)
   - NFT minteado
   - Emite `TokenMinted(client, timeStamp, tokenId)`

**9. BlockchainService escucha evento**
   ```typescript
   async handleTokenMinted(logs, contractAddress) {
     const { client, timeStamp, tokenId } = log.args;

     // Find order by timestamp
     const order = await this.orderModel.findOne({
       'blockchain.expectedTimestamp': timeStamp,
       'blockchain.contractAddress': contractAddress,
     });

     if (order) {
       // Update with tokenId
       order.blockchain.tokenId = tokenId;
       order.blockchain.confirmed = true;
       order.status = 'confirmed';
       await order.save();

       console.log(`✅ Order ${order._id} confirmed with tokenId ${tokenId}`);
     }
   }
   ```

**10. Usuario recibe confirmación**
   - Email con QR code
   - Ticket con tokenId en wallet virtual
   - Puede ver en blockchain explorer

---

## 6. CONFIGURACIÓN REQUERIDA

### 6.1 Variables de Entorno

**Archivo**: `futura-tickets-admin-api/.env`

```bash
# ========================================
# BLOCKCHAIN CONFIGURATION
# ========================================

# Enable/disable blockchain features
BLOCKCHAIN_ENABLED=true

# Factory contract address (deploy once)
FACTORY_CONTRACT_ADDRESS=0x...  # Deploy con: npx hardhat deploy --network baseSepolia

# Alchemy API key (RPC provider)
ALCHEMY_API_KEY=your_alchemy_key_here
# Get from: https://dashboard.alchemy.com/

# Pimlico API key (Account Abstraction)
PIMLICO_API_KEY=your_pimlico_key_here
# Get from: https://dashboard.pimlico.io/

# Wallet encryption key (32 bytes hex)
WALLET_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Network
BLOCKCHAIN_NETWORK=baseSepolia  # o 'base' para mainnet
CHAIN_ID=84532  # Base Sepolia

# Optional: Gas settings
MAX_FEE_PER_GAS=50
MAX_PRIORITY_FEE_PER_GAS=2
```

### 6.2 Package.json Dependencies

**Verificar que existen**:
```json
{
  "dependencies": {
    "ethers": "^6.13.1",
    "viem": "^2.20.0",
    "permissionless": "^0.1.0",
    "@openzeppelin/contracts": "^5.0.2"
  }
}
```

### 6.3 ABI del Contrato

**Copiar ABI después de compilar**:

```bash
cd futura-tickets-contracts-v2
npx hardhat compile

# Copiar ABI al backend
cp artifacts/contracts/FuturaEvent.sol/FuturaEvent.json \
   ../futura-tickets-admin-api/src/abis/FuturaEvent.json

cp artifacts/contracts/FuturaEventFactory.sol/FuturaEventFactory.json \
   ../futura-tickets-admin-api/src/abis/FuturaEventFactory.json
```

---

## 7. TESTING Y DEPLOYMENT

### 7.1 Testing Local

**1. Test Smart Contracts**:
```bash
cd futura-tickets-contracts-v2
npm install
npx hardhat test
npx hardhat coverage
```

**2. Test Backend Services**:
```typescript
// futura-tickets-admin-api/src/Abstraction/__tests__/abstraction.service.spec.ts
describe('AbstractionService', () => {
  it('should create Smart Account Client', async () => {
    const privateKey = '0x...';
    const client = await service.getSmartAccountClient(privateKey);
    expect(client).toBeDefined();
    expect(client.account.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it('should send transaction', async () => {
    const client = await service.getSmartAccountClient('0x...');
    const txHash = await service.sendTransaction(
      client,
      '0xRecipient...',
      '0xCallData...'
    );
    expect(txHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });
});
```

### 7.2 Deploy a Testnet

**1. Deploy Factory Contract**:
```bash
cd futura-tickets-contracts-v2

# Asegurar que .env tiene:
# ALCHEMY_API_KEY=...
# DEPLOYER_PRIVATE_KEY=0x...
# BASESCAN_API_KEY=...

npx hardhat deploy --network baseSepolia --tags factory

# Output:
# ✅ FuturaEventFactory deployed!
# Address: 0x1234567890abcdef1234567890abcdef12345678
# Transaction: 0x...

# Copiar address a backend .env
echo "FACTORY_CONTRACT_ADDRESS=0x1234..." >> ../futura-tickets-admin-api/.env
```

**2. Verificar en Basescan**:
```bash
npx hardhat verify:verify \
  --network baseSepolia \
  0x1234567890abcdef1234567890abcdef12345678
```

**3. Crear evento de prueba**:
```bash
# Editar scripts/create-event.ts con datos del evento
npx hardhat run scripts/create-event.ts --network baseSepolia

# Output:
# ✅ Event Contract Created!
#   Event ID: 1
#   Contract Address: 0xabcdef...
```

**4. Start Backend con Listeners**:
```bash
cd futura-tickets-admin-api

# Asegurar BLOCKCHAIN_ENABLED=true en .env
npm run start:dev

# Logs esperados:
# 🔗 Starting blockchain event listeners...
# 📡 Setting up listeners for 0 existing event contracts
# ✅ Blockchain event listeners active
```

### 7.3 Test End-to-End

**Flujo completo de compra**:

1. **Crear evento con blockchain**:
   ```bash
   # Via admin dashboard
   POST /admin/events/create
   {
     "name": "Test Concert",
     "isBlockchain": true,
     // ... other fields
   }
   ```

2. **Deploy contract para evento**:
   ```typescript
   // Esto debería ocurrir automáticamente en createEvent()
   const tx = await factoryContract.createNew(
     promoterAddress,
     eventName,
     maxSupply,
     baseURI
   );
   const receipt = await tx.wait();
   const eventAddress = parseEvent(receipt).contractAddress;

   // Update event in DB
   await Event.updateOne({ _id: eventId }, { address: eventAddress });
   ```

3. **Comprar tickets**:
   ```bash
   # Via marketplace
   POST /orders/create
   {
     "event": "event_id",
     "items": [{ "type": "General", "amount": 2, "price": 50 }],
     "contactDetails": { ... }
   }

   # Pay with Stripe (testnet card: 4242 4242 4242 4242)
   ```

4. **Verificar mint en blockchain**:
   ```bash
   # Check Basescan
   https://sepolia.basescan.org/address/0x{eventAddress}

   # Debería ver:
   # - Transaction: mintNFT
   # - Event: TokenMinted(client, timestamp, tokenId)
   ```

5. **Verificar DB actualizada**:
   ```javascript
   // MongoDB
   db.orders.findOne({ paymentId: 'pi_...' })
   // Debería tener:
   {
     blockchain: {
       tokenId: 1,
       contractAddress: '0x...',
       transactionHash: '0x...',
       confirmed: true
     }
   }
   ```

### 7.4 Deploy a Mainnet (Base)

**⚠️ PRECAUCIONES**:
- ✅ Auditar contratos profesionalmente
- ✅ Test exhaustivo en testnet (mínimo 1 semana)
- ✅ Bug bounty program
- ✅ Pausable implementado
- ✅ Multisig wallet para owner
- ✅ Monitoring 24/7
- ✅ Backup de private keys

**Proceso**:
```bash
cd futura-tickets-contracts-v2

# 1. Auditoría externa
# Contratar Consensys Diligence, OpenZeppelin, Trail of Bits

# 2. Deploy a mainnet
npx hardhat deploy --network base --tags factory

# 3. Verify
npx hardhat verify --network base 0x...

# 4. Transfer ownership a multisig
npx hardhat run scripts/transfer-ownership.ts --network base

# 5. Update backend env
FACTORY_CONTRACT_ADDRESS=0x...  # Mainnet address
BLOCKCHAIN_NETWORK=base
CHAIN_ID=8453
```

---

## 8. TROUBLESHOOTING

### 8.1 Problemas Comunes

#### Error: "PIMLICO_API_KEY not configured"

**Causa**: Falta configurar Pimlico API key

**Solución**:
```bash
# 1. Crear cuenta en https://dashboard.pimlico.io/
# 2. Crear nuevo proyecto
# 3. Copiar API key
# 4. Agregar a .env
PIMLICO_API_KEY=pim_xxxxx
```

#### Error: "Smart Account deployment failed"

**Causa**: Insufficient funds o network issue

**Solución**:
```bash
# 1. Verificar balance del deployer
# 2. Faucet para testnet: https://faucet.quicknode.com/base/sepolia
# 3. Retry transaction con mayor gas
```

#### Error: "TokenMinted event not caught"

**Causa**: BlockchainService no está escuchando

**Solución**:
```typescript
// 1. Verificar que BLOCKCHAIN_ENABLED=true
// 2. Check logs:
console.log(blockchainService.getStatus());
// { isListening: true, activeWatchers: 2 }

// 3. Manual sync si es necesario:
await blockchainService.syncEventRange(
  startBlock,
  endBlock
);
```

#### Error: "Transaction underpriced"

**Causa**: Gas price muy bajo

**Solución**:
```bash
# Aumentar en .env:
MAX_FEE_PER_GAS=100
MAX_PRIORITY_FEE_PER_GAS=5
```

### 8.2 Debugging

**Logs de transacciones**:
```typescript
// Enable verbose logging
console.log('Smart Account Address:', smartAccount.address);
console.log('Call Data:', callData);
console.log('Transaction Hash:', txHash);

// Check transaction receipt
const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
console.log('Receipt:', receipt);
```

**Verificar estado de NFT**:
```typescript
const eventContract = new ethers.Contract(eventAddress, ABI, provider);

// Check owner
const owner = await eventContract.ownerOf(tokenId);
console.log('Owner:', owner);

// Check details
const details = await eventContract.nftDetails(tokenId);
console.log('Details:', details);
// { price, creator, royaltyPercentage, status }
```

### 8.3 Rollback Plan

**Si hay problemas en producción**:

1. **Pause contracts**:
   ```solidity
   // Owner ejecuta:
   eventContract.pause();
   ```

2. **Disable blockchain en backend**:
   ```bash
   BLOCKCHAIN_ENABLED=false
   ```

3. **Fallback a sistema anterior**:
   - Tickets sin blockchain
   - Solo DB + QR codes
   - Sin Account Abstraction

4. **Fix y redeploy**:
   - Corregir bug
   - Deploy nuevo contrato
   - Migrar datos si es necesario

---

## CONCLUSIÓN

### Estado de Implementación

| Componente | Estado | Prioridad |
|-----------|--------|-----------|
| Smart Contracts | ✅ 100% | Alta |
| Hardhat Setup | ✅ 100% | Alta |
| Tests | ✅ 100% | Alta |
| Deployment Scripts | ✅ 100% | Alta |
| AbstractionService | ✅ 100% | Alta |
| BlockchainService | ✅ 100% | Alta |
| Schemas | ✅ 100% | Alta |
| **Wallet Management** | ❌ 0% | **CRÍTICA** |
| **Integración mintTicket()** | ❌ 0% | **CRÍTICA** |
| **ABIs copiados** | ❌ 0% | Alta |
| **Variables de entorno** | ⏸️ 50% | Alta |
| **Testing E2E** | ❌ 0% | Media |
| **Deploy a testnet** | ❌ 0% | Media |
| **Documentación usuario** | ❌ 0% | Baja |

### Próximos Pasos

**Inmediatos** (1-2 días):
1. ✅ Crear WalletService
2. ✅ Modificar mintTicket() en admin-event.service.ts
3. ✅ Copiar ABIs al backend
4. ✅ Configurar todas las env variables
5. ✅ Test unitario de integración

**Corto plazo** (3-5 días):
1. Deploy Factory a Base Sepolia
2. Crear evento de prueba
3. Test completo de compra E2E
4. Fix bugs encontrados
5. Documentar proceso

**Mediano plazo** (1-2 semanas):
1. Testing extensivo en testnet
2. Optimizaciones de gas
3. Monitoring y alertas
4. Auditoría externa
5. Preparar mainnet

### Riesgos y Mitigaciones

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Bug en smart contract | Alto | Baja | Auditoría + tests exhaustivos |
| Fallo en Account Abstraction | Medio | Media | Fallback a EOA transactions |
| High gas costs | Bajo | Media | Paymaster sponsorship |
| Event listener falla | Medio | Baja | Manual sync + monitoring |
| Private key compromise | Alto | Baja | Encryption + secure storage |

---

**Documento creado por**: Claude Code
**Última actualización**: 2025-10-15
**Versión**: 1.0.0
**Status**: Living Document (se actualizará con progreso)
