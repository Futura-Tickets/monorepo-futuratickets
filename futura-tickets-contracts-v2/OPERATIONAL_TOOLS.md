# 🛠️ OPERATIONAL TOOLS GUIDE

**Version**: 2.0.0
**Last Updated**: 2025-10-17
**Status**: Production Ready

---

## 📋 ÍNDICE

1. [Introducción](#introducción)
2. [Event Monitoring System](#1-event-monitoring-system)
3. [Admin CLI Tools](#2-admin-cli-tools)
4. [Enhanced Deployment Scripts](#3-enhanced-deployment-scripts)
5. [Diagnostic Tools](#4-diagnostic-tools)
6. [Ejemplos Completos](#5-ejemplos-completos)
7. [Integración con Backends](#6-integración-con-backends)
8. [Troubleshooting](#7-troubleshooting)

---

## INTRODUCCIÓN

Este documento describe todas las herramientas operacionales desarrolladas para facilitar la gestión, monitoreo y deployment de los contratos inteligentes de FuturaTickets.

### 🎯 Objetivos

- ✅ **Monitoreo en tiempo real** de eventos blockchain
- ✅ **Administración fácil** de contratos sin código
- ✅ **Deployment robusto** con verificación automática
- ✅ **Diagnóstico rápido** de problemas comunes
- ✅ **Integración sencilla** con backends

### 🚀 Quick Start

```bash
# 1. Verificar que todo está OK
npm run diagnose

# 2. Ver estado del sistema
npm run admin status

# 3. Listar eventos creados
npm run admin event:list

# 4. Monitorear eventos en tiempo real
npm run monitor
```

---

## 1. EVENT MONITORING SYSTEM

### 📍 Ubicación

- **Librería**: `lib/event-monitor.ts`
- **Ejemplo**: `examples/event-monitoring.ts`

### 🎯 Propósito

Sistema completo para escuchar y procesar eventos blockchain en tiempo real, diseñado para integración con backends.

### ✨ Features

- ✅ Event listening con auto-reconexión
- ✅ Histórico de eventos desde cualquier bloque
- ✅ Filtrado por eventos específicos
- ✅ Handlers personalizables por evento
- ✅ Error handling robusto
- ✅ TypeScript types completos

### 📖 Uso Básico

#### Escuchar Nuevos Eventos

```typescript
import { EventMonitor, NETWORKS, CONTRACT_ADDRESSES } from './lib';

const monitor = new EventMonitor({
  rpcUrl: NETWORKS.hardhat.rpcUrl,
  factoryAddress: CONTRACT_ADDRESSES.hardhat.factoryAddress
});

// Escuchar cuando se crea un nuevo contrato de evento
monitor.onFactoryEventCreated(async (event) => {
  console.log('Nuevo evento creado:', event.eventAddress);

  // Guardar en base de datos
  await Event.create({
    address: event.eventAddress,
    blockNumber: event.blockNumber,
    transactionHash: event.transactionHash
  });
});
```

#### Escuchar Tickets Minteados

```typescript
// Dirección de un contrato de evento específico
const eventAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

monitor.onTokenMinted(eventAddress, async (event) => {
  console.log('Ticket minteado:', {
    tokenId: event.tokenId,
    cliente: event.client,
    timestamp: event.timestamp
  });

  // Actualizar Sale en BD
  await Sale.updateOne(
    { clientAddress: event.client, tokenId: null },
    {
      tokenId: event.tokenId,
      mintedAt: new Date(event.timestamp * 1000),
      blockNumber: event.blockNumber
    }
  );
});
```

#### Auto-Registro de Nuevos Eventos

```typescript
await monitor.autoRegisterNewEvents(async (eventAddress) => {
  console.log('Auto-registrando listeners para', eventAddress);

  // Escuchar todos los eventos del nuevo contrato
  monitor.onAllEvents(eventAddress, {
    onMinted: async (event) => {
      console.log('Ticket minteado:', event.tokenId);
    },
    onPriced: async (event) => {
      console.log('Precio actualizado:', event.price);
    },
    onCancel: async (event) => {
      console.log('Venta cancelada:', event.tokenId);
    },
    onTransfer: async (event) => {
      console.log('Transfer:', event.tokenId);
    }
  });
});
```

#### Obtener Histórico

```typescript
// Obtener todos los eventos creados desde el bloque 0
const factoryEvents = await monitor.getFactoryEventsHistory(0);

console.log(`Encontrados ${factoryEvents.length} eventos`);

// Obtener tickets minteados de un evento específico
const tickets = await monitor.getTokenMintedHistory(eventAddress, 0);

console.log(`Encontrados ${tickets.length} tickets`);
```

### 🔄 Integración Backend Completa

```typescript
// PASO 1: Sincronizar histórico al iniciar
const historicalEvents = await monitor.getFactoryEventsHistory(0);

for (const event of historicalEvents) {
  await Event.findOneAndUpdate(
    { address: event.eventAddress },
    {
      address: event.eventAddress,
      blockNumber: event.blockNumber,
      deploymentTxHash: event.transactionHash
    },
    { upsert: true }
  );
}

// PASO 2: Escuchar nuevos eventos en tiempo real
monitor.onFactoryEventCreated(async (event) => {
  await Event.create({
    address: event.eventAddress,
    blockNumber: event.blockNumber
  });

  // Auto-registrar listeners
  monitor.onAllEvents(event.eventAddress, {
    onMinted: async (e) => { /* ... */ },
    onPriced: async (e) => { /* ... */ }
  });
});

// PASO 3: Monitoreo de salud
setInterval(() => {
  const status = monitor.getStatus();
  console.log('Monitor status:', status.connected ? '✅' : '❌');
}, 30000);
```

### 📊 Eventos Disponibles

| Evento | Origen | Descripción |
|--------|--------|-------------|
| `FuturaEventCreated` | Factory | Se crea un nuevo contrato de evento |
| `TokenMinted` | Event | Se mintea un nuevo ticket NFT |
| `TokenPriced` | Event | Se establece precio de reventa |
| `TokenCancel` | Event | Se cancela una reventa |
| `Transfer` | Event | Se transfiere un ticket |

### 🧪 Testing

```bash
# Ejecutar ejemplo con histórico
npm run example:monitor
```

---

## 2. ADMIN CLI TOOLS

### 📍 Ubicación

- **Script**: `scripts/admin-cli.ts`
- **Comando**: `npm run admin`

### 🎯 Propósito

Herramienta de línea de comandos para administrar contratos sin escribir código.

### ✨ Comandos Disponibles

#### Status & Info

```bash
# Ver estado general del sistema
npm run admin status

# Información del Factory contract
npm run admin factory:info

# Información de un evento específico
npm run admin event:info 0x123...

# Listar todos los eventos creados
npm run admin event:list
```

#### Ticket Management

```bash
# Info completa de un ticket
npm run admin ticket:info 0x123... 1

# Estado de un ticket
npm run admin ticket:status 0x123... 1

# Transferir ticket
npm run admin ticket:transfer 0x123... 1 0xABC...
```

#### Contract Management

```bash
# Pausar contrato (emergencia)
npm run admin contract:pause 0x123...

# Reanudar contrato
npm run admin contract:unpause 0x123...

# Ver owner del contrato
npm run admin contract:owner 0x123...
```

#### Utilities

```bash
# Ver balance de una dirección
npm run admin balance 0x123...

# Ver bloque actual
npm run admin block

# Listar cuentas disponibles
npm run admin accounts
```

### 📖 Ejemplos de Uso

#### Ver Estado del Sistema

```bash
$ npm run admin status

═══════════════════════════════════════════════
  🔍 SYSTEM STATUS
═══════════════════════════════════════════════

Network Info:
─────────────────────────────────────────────
  Chain ID: 31337
  Name: unknown
  Current block: 15
  RPC URL: http://127.0.0.1:8545

Factory Contract:
─────────────────────────────────────────────
  Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅   Status: Deployed ✅
  Events created: 3

Admin Wallet:
─────────────────────────────────────────────
  Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  Balance: 9999.9935 ETH

✅ System status retrieved successfully
```

#### Listar Eventos

```bash
$ npm run admin event:list

═══════════════════════════════════════════════
  📋 EVENTS LIST
═══════════════════════════════════════════════

Found 3 events:

1. 0xa16E02E87b7454126E5E10d957A927A7F5B5d2be
   📛 Name: Rock Concert 2025 (TKT)
   👤 Owner: 0xf39F...2266
   🎫 Tickets minted: 5
   🔢 Block: 3

2. 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0
   📛 Name: Tech Conference (TKT)
   👤 Owner: 0xf39F...2266
   🎫 Tickets minted: 12
   🔢 Block: 8

3. 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
   📛 Name: Art Exhibition (TKT)
   👤 Owner: 0xf39F...2266
   🎫 Tickets minted: 3
   🔢 Block: 15

✅ Events list retrieved successfully
```

#### Info de un Ticket

```bash
$ npm run admin ticket:info 0xa16E02E87b7454126E5E10d957A927A7F5B5d2be 1

═══════════════════════════════════════════════
  🎫 TICKET INFO: #1
═══════════════════════════════════════════════

📍 Event Contract: 0xa16E02E87b7454126E5E10d957A927A7F5B5d2be
🔢 Token ID: 1
👤 Owner: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
💰 Price: 0.05 ETH
🎨 Creator: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
💎 Royalty: 5%
📊 Status: OPEN

✅ Ticket info retrieved successfully
```

### 🔐 Permisos

- **Read commands**: No requieren private key
- **Write commands**: Requieren `DEPLOYER_PRIVATE_KEY_LOCAL` en `.env`

---

## 3. ENHANCED DEPLOYMENT SCRIPTS

### 📍 Ubicación

- **Script**: `scripts/deploy-enhanced.ts`
- **Comando**: `npm run deploy:enhanced`

### 🎯 Propósito

Sistema robusto de deployment con validación, logging y verificación automática.

### ✨ Features

- ✅ Pre-deployment validation
- ✅ Multi-network support (hardhat, baseSepolia, base)
- ✅ Automatic block explorer verification
- ✅ Deployment logging to JSON
- ✅ Error handling completo
- ✅ Post-deployment validation
- ✅ Gas estimation
- ✅ Deployment history tracking

### 📖 Uso

#### Deployment Local (Hardhat)

```bash
npm run deploy:enhanced -- --network hardhat
```

#### Deployment Testnet (Base Sepolia)

```bash
# Asegúrate de tener configurado:
# - DEPLOYER_PRIVATE_KEY_TESTNET
# - ALCHEMY_API_KEY
# - BASESCAN_API_KEY (para verificación)

npm run deploy:enhanced -- --network baseSepolia
```

#### Deployment Mainnet (Base)

```bash
# ⚠️ PRECAUCIÓN: Revisa PRODUCTION_READY_CHECKLIST.md primero

npm run deploy:enhanced -- --network base
```

### 📊 Output del Deployment

```bash
═══════════════════════════════════════════════
  🚀 ENHANCED DEPLOYMENT SCRIPT
═══════════════════════════════════════════════

Target Network: Hardhat Local
Chain ID: 31337
Testnet: Yes

🔍 Pre-Deployment Checks
─────────────────────────────────────────────
Network: Hardhat Local (chainId: 31337)
✅ Private key configured: DEPLOYER_PRIVATE_KEY_LOCAL
Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 9999.9935 ETH
✅ Balance sufficient for deployment
✅ Contracts compiled successfully

✅ All pre-deployment checks passed!

🚀 Deploying FuturaEventFactory
─────────────────────────────────────────────
Network: Hardhat Local
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Estimating gas...
Estimated gas: 2456789
Max fee per gas: 50.0 gwei
Max priority fee: 2.0 gwei
Estimated total cost: 0.122839450 ETH

⚠️  Deploying contract... This may take a few moments.
Transaction hash: 0xabc123...
Waiting for confirmation...

✅ Factory deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Block number: 3
Gas used: 2456789
Actual cost: 0.122839450 ETH

✓ Post-Deployment Validation
─────────────────────────────────────────────
✅ Contract code verified on chain
✅ Contract interface validated

✅ All post-deployment validations passed!

🔎 Verifying Contract on Block Explorer
─────────────────────────────────────────────
⚠️  Skipping verification for local network

💾 Saving Deployment Info
─────────────────────────────────────────────
✅ Deployment saved to: deployments/hardhat/FuturaEventFactory.json
ℹ️  Updated FACTORY_CONTRACT_ADDRESS in .env.example

✅ ═══════════════════════════════════════════
✅   DEPLOYMENT SUMMARY
✅ ═══════════════════════════════════════════
✅ Network:          Hardhat Local
✅ Factory Address:  0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ Deployer:         0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
✅ Block Number:     3
✅ Gas Used:         2456789
✅ Transaction Hash: 0xabc123...
✅ Verified:         No ⏳
✅ Timestamp:        2025-10-17T12:34:56.789Z
✅ ═══════════════════════════════════════════

🎉 Deployment completed successfully!

📋 Next Steps
─────────────────────────────────────────────
1. Update your .env file with the factory address:
   FACTORY_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

2. Export ABIs:
   npm run export-abis

3. Sync ABIs to backends:
   npm run sync-abis
```

### 📁 Deployment History

Los deployments se guardan en `deployments/{network}/`:

```json
{
  "network": "hardhat",
  "factoryAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "deployer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "blockNumber": 3,
  "transactionHash": "0xabc123...",
  "gasUsed": "2456789",
  "timestamp": "2025-10-17T12:34:56.789Z",
  "verified": false
}
```

---

## 4. DIAGNOSTIC TOOLS

### 📍 Ubicación

- **Script**: `scripts/diagnose.ts`
- **Comando**: `npm run diagnose`

### 🎯 Propósito

Herramienta para diagnosticar problemas comunes en el entorno blockchain.

### ✨ Checks Realizados

1. ✅ Node.js version (>= v18)
2. ✅ NPM packages instalados
3. ✅ Contratos compilados
4. ✅ ABIs exportados
5. ✅ Nodo blockchain corriendo
6. ✅ Contratos desplegados
7. ✅ Variables de entorno
8. ✅ ABIs sincronizados con backends
9. ✅ Balance del deployer

### 📖 Uso

```bash
npm run diagnose
```

### 📊 Output

```bash
═══════════════════════════════════════════════
  🔧 BLOCKCHAIN ENVIRONMENT DIAGNOSTICS
═══════════════════════════════════════════════

Running diagnostic checks...
─────────────────────────────────────────────

Diagnostic Results:
─────────────────────────────────────────────
✅ Node.js Version
   Node.js v22.17.0 (✓ >= v18 required)

✅ NPM Packages
   All required packages installed

✅ Contracts Compiled
   Contracts compiled successfully

✅ ABIs Exported
   ABIs exported successfully

✅ Blockchain Node
   Node running at http://127.0.0.1:8545 (block 15)

✅ Factory Deployed
   Factory deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3

✅ Environment Variables
   All required environment variables set

✅ ABIs Synced
   ABIs synced to 4 backends

✅ Deployer Balance
   Balance: 9999.9935 ETH

Summary:
─────────────────────────────────────────────
✅ Passed: 9/9
✅ Failed: 0/9

═══════════════════════════════════════════════
  🎉 ALL CHECKS PASSED! Environment is ready.
═══════════════════════════════════════════════
```

### ⚠️ Cuando Algo Falla

```bash
❌ Blockchain Node
   Node not reachable at http://127.0.0.1:8545
   Fix: Run: npm run setup (or ./start-blockchain.sh)

Quick Fix Commands:
─────────────────────────────────────────────
• Run: npm run setup (or ./start-blockchain.sh)
• Run: npm run compile
• Run: npm run export-abis
```

---

## 5. EJEMPLOS COMPLETOS

### 📍 Ubicación

- `examples/backend-integration.ts` - Integración básica
- `examples/event-monitoring.ts` - Monitoreo de eventos

### 📖 Ejemplo: Integración Backend Completa

```typescript
import {
  BlockchainService,
  EventMonitor,
  NETWORKS,
  CONTRACT_ADDRESSES
} from '../lib';

// 1. Crear servicio blockchain
const blockchain = new BlockchainService({
  rpcUrl: NETWORKS.hardhat.rpcUrl,
  factoryAddress: CONTRACT_ADDRESSES.hardhat.factoryAddress,
  privateKey: process.env.DEPLOYER_PRIVATE_KEY_LOCAL!
});

// 2. Crear monitor de eventos
const monitor = new EventMonitor({
  rpcUrl: NETWORKS.hardhat.rpcUrl,
  factoryAddress: CONTRACT_ADDRESSES.hardhat.factoryAddress
});

// 3. Sincronizar histórico al iniciar
async function syncHistorical() {
  const events = await monitor.getFactoryEventsHistory(0);

  for (const event of events) {
    await Event.findOneAndUpdate(
      { address: event.eventAddress },
      { ...event },
      { upsert: true }
    );

    const tickets = await monitor.getTokenMintedHistory(event.eventAddress, 0);
    for (const ticket of tickets) {
      await Sale.updateOne(
        { tokenId: ticket.tokenId },
        { ...ticket },
        { upsert: true }
      );
    }
  }
}

// 4. Escuchar nuevos eventos
async function setupListeners() {
  // Nuevos contratos
  monitor.onFactoryEventCreated(async (event) => {
    await Event.create({ address: event.eventAddress });
  });

  // Tickets minteados
  const events = await Event.find();
  for (const event of events) {
    monitor.onTokenMinted(event.address, async (ticket) => {
      await Sale.updateOne(
        { clientAddress: ticket.client, tokenId: null },
        { tokenId: ticket.tokenId }
      );
    });
  }
}

// 5. Iniciar
async function start() {
  await syncHistorical();
  await setupListeners();
  console.log('Blockchain integration active');
}

start();
```

---

## 6. INTEGRACIÓN CON BACKENDS

### 🎯 Backends Soportados

1. **futura-tickets-admin-api** - Admin panel
2. **futura-tickets-rest-api** - Main API
3. **futura-market-place-api** - Marketplace
4. **futura-access-api** - Access control

### 📝 Paso a Paso

#### 1. Instalar Dependencias

En cada backend:

```bash
npm install ethers@^6.11.1
```

#### 2. Importar Librería

```typescript
// En tu backend service
import {
  BlockchainService,
  EventMonitor,
  NETWORKS,
  CONTRACT_ADDRESSES,
  TicketStatus
} from '../../futura-tickets-contracts-v2/lib';
```

#### 3. Configurar Servicio

```typescript
// services/blockchain.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { BlockchainService, EventMonitor } from '../../contracts/lib';

@Injectable()
export class BlockchainIntegrationService implements OnModuleInit {
  private blockchain: BlockchainService;
  private monitor: EventMonitor;

  constructor() {
    this.blockchain = new BlockchainService({
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
      factoryAddress: process.env.FACTORY_ADDRESS,
      privateKey: process.env.DEPLOYER_PRIVATE_KEY
    });

    this.monitor = new EventMonitor({
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
      factoryAddress: process.env.FACTORY_ADDRESS
    });
  }

  async onModuleInit() {
    await this.setupEventListeners();
  }

  private async setupEventListeners() {
    // Escuchar nuevos eventos
    this.monitor.onFactoryEventCreated(async (event) => {
      // Guardar en BD
    });

    // Escuchar tickets
    this.monitor.onTokenMinted(eventAddress, async (ticket) => {
      // Actualizar BD
    });
  }

  async createEvent(promoter: string, name: string) {
    return await this.blockchain.createEvent({
      promoterAddress: promoter,
      eventName: name,
      maxSupply: 1000,
      baseURI: 'https://api.example.com/metadata/'
    });
  }

  async mintTicket(eventAddress: string, client: string, price: string) {
    return await this.blockchain.mintTicket({
      eventContractAddress: eventAddress,
      clientAddress: client,
      priceInEth: price,
      royaltyPercentage: 5
    });
  }
}
```

#### 4. Usar en Controllers

```typescript
@Controller('events')
export class EventsController {
  constructor(
    private readonly blockchainService: BlockchainIntegrationService
  ) {}

  @Post('create')
  async createEvent(@Body() dto: CreateEventDto) {
    const result = await this.blockchainService.createEvent(
      dto.promoterAddress,
      dto.eventName
    );

    // Guardar en BD
    await this.eventsService.save({
      address: result.contractAddress,
      transactionHash: result.transactionHash
    });

    return result;
  }

  @Post('mint')
  async mintTicket(@Body() dto: MintTicketDto) {
    const result = await this.blockchainService.mintTicket(
      dto.eventAddress,
      dto.clientAddress,
      dto.price
    );

    // Actualizar Sale en BD
    await this.salesService.update(dto.saleId, {
      tokenId: result.tokenId,
      mintedAt: new Date()
    });

    return result;
  }
}
```

### 🔄 Sincronización de ABIs

Los ABIs se sincronizan automáticamente a los backends:

```bash
npm run sync-abis
```

Esto copia los ABIs a:
- `futura-tickets-admin-api/src/abis/`
- `futura-tickets-rest-api/src/abis/`
- `futura-market-place-api/src/abis/`
- `futura-access-api/src/abis/`

---

## 7. TROUBLESHOOTING

### 🔴 Problema: "Node not reachable"

```bash
❌ Blockchain Node
   Node not reachable at http://127.0.0.1:8545
```

**Solución**:
```bash
npm run setup
# o
./start-blockchain.sh
```

---

### 🔴 Problema: "Factory not deployed"

```bash
❌ Factory Deployed
   Factory not deployed at 0x5FbDB...
```

**Solución**:
```bash
npm run deploy
# o para deployment completo:
npm run deploy:enhanced -- --network hardhat
```

---

### 🔴 Problema: "ABIs not exported"

```bash
❌ ABIs Exported
   ABIs not exported
```

**Solución**:
```bash
npm run export-abis
```

---

### 🔴 Problema: "ABIs not synced"

```bash
❌ ABIs Synced
   ABIs not synced to backends
```

**Solución**:
```bash
npm run sync-abis
```

---

### 🔴 Problema: TypeScript errors en backend

```
Cannot find module '../../contracts/lib'
```

**Solución**:
1. Verifica que los ABIs estén sincronizados
2. Verifica el path relativo en tu import
3. Usa la exportación desde `lib/index.ts`:

```typescript
// ✅ Correcto
import { BlockchainService } from '../../futura-tickets-contracts-v2/lib';

// ❌ Incorrecto
import { BlockchainService } from '../../futura-tickets-contracts-v2/lib/blockchain-helpers';
```

---

### 🔴 Problema: "Nonce has already been used"

```
Error: nonce has already been used
```

**Solución**: Esto es normal en desarrollo. El nonce se reutiliza cuando:
- Re-ejecutas scripts sin reiniciar el nodo
- Múltiples transacciones en paralelo

Para desarrollo local, reinicia el nodo:
```bash
npm run clean:all
npm run setup
```

---

### 🔴 Problema: Monitor no recibe eventos

**Solución**:
1. Verifica que el nodo esté corriendo:
   ```bash
   npm run healthcheck
   ```

2. Verifica el estado del monitor:
   ```typescript
   const status = monitor.getStatus();
   console.log('Connected:', status.connected);
   ```

3. Verifica la configuración:
   ```typescript
   // Aumenta el polling interval si es necesario
   const monitor = new EventMonitor({
     rpcUrl: RPC_URL,
     factoryAddress: FACTORY_ADDRESS,
     pollingInterval: 2000 // 2 segundos
   });
   ```

---

## 📚 RECURSOS ADICIONALES

### Documentación Relacionada

- `README.md` - Overview del proyecto
- `QUICK_START_DEV.md` - Setup rápido para desarrollo
- `TERMINAL_BLOCKCHAIN.md` - Referencia completa de comandos
- `PRODUCTION_READY_CHECKLIST.md` - Checklist pre-producción
- `CHANGELOG.md` - Historial de versiones

### Scripts NPM

```bash
# Blockchain
npm run setup              # Setup completo
npm run chain              # Iniciar nodo
npm run deploy             # Deploy estándar
npm run deploy:enhanced    # Deploy mejorado

# Compilación
npm run compile            # Compilar contratos
npm run export-abis        # Exportar ABIs
npm run sync-abis          # Sincronizar ABIs
npm run build              # Build completo

# Testing
npm run test               # Tests
npm run test:coverage      # Coverage
npm run test:gas           # Gas report

# Administración
npm run admin              # CLI admin
npm run diagnose           # Diagnóstico
npm run monitor            # Monitor eventos
npm run healthcheck        # Health check

# Mantenimiento
npm run clean              # Limpiar artifacts
npm run clean:all          # Limpiar todo
npm run verify             # Verificar setup
```

---

## 🎯 QUICK REFERENCE

### Flujo de Trabajo Típico

1. **Iniciar desarrollo**:
   ```bash
   npm run diagnose        # Verificar entorno
   npm run setup           # Iniciar nodo + deploy
   ```

2. **Durante desarrollo**:
   ```bash
   npm run admin status    # Ver estado
   npm run monitor         # Monitorear eventos
   npm run admin event:list # Listar eventos
   ```

3. **Deploy a testnet**:
   ```bash
   npm run deploy:enhanced -- --network baseSepolia
   npm run admin status
   ```

4. **Integrar con backend**:
   ```bash
   npm run export-abis     # Exportar ABIs
   npm run sync-abis       # Sincronizar
   ```

5. **Troubleshooting**:
   ```bash
   npm run diagnose        # Diagnosticar problemas
   npm run clean:all       # Reset completo
   ```

---

**FIN DEL DOCUMENTO**

**Versión**: 2.0.0
**Última actualización**: 2025-10-17
**Mantenido por**: FuturaTickets Team
**Estado**: ✅ Production Ready
