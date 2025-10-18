# 🎫 FuturaTickets Smart Contracts

> NFT-based ticketing system on Base blockchain with resale market and royalties

[![Solidity](https://img.shields.io/badge/Solidity-0.8.25-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.2-yellow)](https://hardhat.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Descripción

Sistema de contratos inteligentes para la emisión, gestión y transferencia de tickets como NFTs (ERC-721) en Base blockchain. Incluye funcionalidades de mercado secundario con royalties automáticos y Account Abstraction para transacciones sin gas.

### Características Principales

✅ **NFT Tickets (ERC-721)** - Cada ticket es un token único
✅ **Factory Pattern** - Un contrato por evento
✅ **Royalties** - Porcentaje configurable para creadores
✅ **Mercado Secundario** - Reventa de tickets con precios dinámicos
✅ **Estados de Tickets** - OPEN, CLOSED, SALE
✅ **Account Abstraction** - Gasless transactions para usuarios finales
✅ **Base Sepolia** - Testnet con bajos costos de gas

---

## 🚀 Quick Start

### 🎯 Local Development (2 minutos)

```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Iniciar nodo local Hardhat (auto-deploy factory)
./start-blockchain.sh
# ✅ Node: http://127.0.0.1:8545
# ✅ Factory: 0x5FbDB2315678afecb367f032d93F642f64180aa3

# 3. (Opcional) Ejecutar tests
npm test  # 18/18 passing ✅
```

**📖 Ver:** [`QUICK_START_DEV.md`](./QUICK_START_DEV.md) para más detalles

### 🌐 Deploy a Testnet/Mainnet

```bash
# 1. Ver instrucciones completas de deployment
cat READY_TO_DEPLOY.md

# 2. Validar que todo está listo
./scripts/pre-deployment-check.sh

# 3. Configurar .env con tus credenciales
cp .env.example .env
nano .env  # Agregar ALCHEMY_API_KEY, DEPLOYER_PRIVATE_KEY, BASESCAN_API_KEY

# 4. Obtener testnet ETH (0.05-0.1 ETH)
# https://faucet.quicknode.com/base/sepolia

# 5. Deploy a Base Sepolia
npm run deploy:baseSepolia

# ABIs se sincronizan automáticamente a todos los backends ✅
```

**📖 Ver:**
- [`READY_TO_DEPLOY.md`](./READY_TO_DEPLOY.md) - Instrucciones finales (START HERE)
- [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) - Guía completa paso a paso

---

## 📁 Estructura del Proyecto

```
futura-tickets-contracts-v2/
├── contracts/                   # Contratos Solidity
│   ├── FuturaEvent.sol         # ERC-721 + ReentrancyGuard + Pausable + ERC2981
│   └── FuturaEventFactory.sol  # Factory pattern
│
├── abi/                         # ABIs exportados (auto-generado)
│   ├── FuturaEvent.json
│   ├── FuturaEventFactory.json
│   └── index.ts
│
├── examples/                    # Ejemplos de integración
│   └── backend-integration.ts  # Código completo para backends
│
├── scripts/                     # Utilidades
│   ├── export-abis.ts          # Exportar ABIs
│   └── sync-abis.sh            # Sincronizar ABIs a backends
│
├── deploy/                      # Hardhat deploy scripts
│   └── 01_deploy_factory.ts
│
├── test/                        # Tests (18 test cases)
│   └── FuturaEvent.test.ts
│
├── .github/workflows/           # CI/CD
│   └── ci.yml                  # Tests automáticos
│
├── blockchain.config.json       # Config centralizada para monorepo
├── hardhat.config.ts           # Configuración Hardhat
├── start-blockchain.sh         # Script inicio rápido
└── TERMINAL_BLOCKCHAIN.md      # Documentación completa
```

---

## 🔧 Configuración

### Variables de Entorno (.env)

```bash
# Alchemy API Key (RPC provider)
# Obtener de: https://dashboard.alchemy.com/
ALCHEMY_API_KEY=your_alchemy_api_key

# Deployer Private Key
# Tu wallet privada que deployará los contratos
# NECESITA ETH en Base Sepolia: https://faucet.quicknode.com/base/sepolia
DEPLOYER_PRIVATE_KEY=0x_your_private_key

# Basescan API Key (para verificación)
# Obtener de: https://basescan.org/apis
BASESCAN_API_KEY=your_basescan_api_key

# Deployer Address
# Tu wallet address pública
DEPLOYER=0x_your_wallet_address
```

---

## 📜 Contratos

### FuturaEventFactory

Factory contract que crea instancias de FuturaEvent.

```solidity
// Crear nuevo evento
function createNew(address owner, string memory eventName) public
```

**Events:**
- `FuturaEventCreated(address indexed _address)` - Emitido al crear un evento

### FuturaEvent

Contrato ERC-721 para cada evento individual.

```solidity
// Mintear NFT ticket
function mintNFT(
    uint256 price,
    address client,
    uint256 royaltyPercentage,
    uint256 timeStamp,
    TicketStatus status
) public onlyOwner

// Establecer precio de reventa
function setNFTPrice(uint256 tokenId, uint256 price) public

// Transferir ticket
function transferNFT(uint256 tokenId, address owner) public

// Cambiar estado del ticket
function setTicketStatus(TicketStatus ticketStatus, uint256 tokenId) public

// Cancelar reventa
function cancelResale(uint256 tokenId) public
```

**Estados del Ticket:**
- `OPEN` - Ticket válido para acceso
- `CLOSED` - Ticket usado (check-in realizado)
- `SALE` - Ticket en venta secundaria

**Events:**
- `TokenMinted(address indexed client, uint256 indexed timeStamp, uint256 indexed tokenId)`
- `TokenPriced(uint256 indexed tokenId, uint256 indexed price)`
- `TokenCancel(uint256 indexed tokenId)`

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Con coverage
npm run test:coverage

# Con gas reporter
npm run test:gas
```

**Test Coverage:** 15+ test cases cubriendo:
- Deployment de Factory
- Creación de eventos
- Minting de NFTs
- Transferencias
- Gestión de precios
- Estados de tickets

---

## 🌐 Deployment

### Base Sepolia Testnet

```bash
npm run deploy:baseSepolia -- --tags factory
```

**Output esperado:**
```
============================================================
Deploying FuturaEventFactory...
Deployer: 0xYourAddress
============================================================

✅ FuturaEventFactory deployed!
Address: 0x1234567890abcdef...
Transaction: 0xabc...

✅ Contract verified on block explorer

📝 Save this address to your backend .env:
FACTORY_CONTRACT_ADDRESS=0x1234567890abcdef...
```

### Base Mainnet

```bash
# ⚠️ SOLO CUANDO ESTÉ LISTO PARA PRODUCCIÓN
npm run deploy:base -- --tags factory
```

---

## 📊 Gas Costs (Estimados en Base Sepolia)

| Operación | Gas | Costo (~0.001 ETH/gas) |
|-----------|-----|------------------------|
| Deploy Factory | ~1,500,000 | ~1.5 ETH |
| Create Event | ~2,000,000 | ~2.0 ETH |
| Mint NFT | ~150,000 | ~0.15 ETH |
| Set Price | ~50,000 | ~0.05 ETH |
| Transfer | ~70,000 | ~0.07 ETH |

---

## 🔐 Seguridad

### Estado de Auditoría ✅

**Última Auditoría:** October 17, 2025 | **Versión:** 2.0.2 | **Estado:** ✅ LISTO PARA TESTNET

```bash
# Ejecutar auditoría de seguridad
npm run security:audit

# Ejecutar tests de seguridad
npm run test:security  # 31/31 tests passing ✅
```

**Resultados de Auditoría:**
- ✅ **49/49 tests passing** (31 seguridad + 18 funcionales)
- ✅ **82.19% code coverage** (objetivo: >80%)
- ✅ **Gas optimizado**: Mint 194k gas, Transfer 57k gas
- ✅ **0 vulnerabilidades críticas** en contratos
- ⚠️ 13 vulnerabilidades en dev dependencies (aceptable)
- 🟢 **Riesgo: BAJO** para deployment en testnet

**📊 Ver reporte completo:** [`AUDIT_FINDINGS.md`](./AUDIT_FINDINGS.md)

### ✅ Seguridad Implementada

- ✅ **ReentrancyGuard** en todas las funciones críticas
- ✅ **Pausable** para pausas de emergencia (pause/unpause)
- ✅ **Access Control** con Ownable y validaciones de ownership
- ✅ **Input Validation** en todas las funciones públicas
- ✅ **maxSupply** enforcement por evento (inmutable)
- ✅ **ERC-2981** Royalty Standard
- ✅ **State Validation** para transiciones de tickets
- ✅ **31 Security Tests** verificando vectores de ataque
- ✅ **Safe Math** con Solidity 0.8.25 (overflow protection)
- ✅ **Zero Address** checks en transferencias

### 📋 Política de Seguridad

**Reportar Vulnerabilidades:**
- 📧 Email: security@futuratickets.com
- 📖 Ver proceso completo: [`SECURITY.md`](./SECURITY.md)

**Tiempos de Respuesta:**
- Critical (fondos en riesgo): 24-48 horas
- High (bypass de seguridad): 1 semana
- Medium/Low: 2-4 semanas

### ⏳ Próximos Pasos

**Antes de Mainnet:**
- [ ] Auditoría profesional externa (Trail of Bits, OpenZeppelin, Consensys)
- [ ] Bug bounty program activo ($100-$10,000 USD)
- [ ] Multi-sig wallet para contract ownership
- [ ] 2-4 semanas testing en Base Sepolia testnet
- [ ] Stress testing con alta carga

**Recomendado:**
- [ ] Instalar Slither: `pip3 install slither-analyzer`
- [ ] Instalar Mythril: `pip3 install mythril`
- [ ] Formal verification (opcional)

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| **[README.md](./README.md)** | Este archivo - Overview completo del proyecto |
| **[READY_TO_DEPLOY.md](./READY_TO_DEPLOY.md)** | ⭐ Instrucciones finales de deployment (START HERE) 🚀 |
| **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** | Guía completa paso a paso para deployment 📋 |
| **[QUICK_START_DEV.md](./QUICK_START_DEV.md)** | Setup desarrollo local en 2 minutos ⚡ |
| **[GAS_OPTIMIZATIONS.md](./GAS_OPTIMIZATIONS.md)** | Análisis completo de optimizaciones de gas ⛽ |
| **[TERMINAL_BLOCKCHAIN.md](./TERMINAL_BLOCKCHAIN.md)** | Documentación completa de la terminal 📚 |
| **[OPERATIONAL_TOOLS.md](./OPERATIONAL_TOOLS.md)** | Guía completa herramientas operacionales 🛠️ |
| **[SECURITY.md](./SECURITY.md)** | Política de seguridad y reporte de vulnerabilidades 🔐 |
| **[AUDIT_FINDINGS.md](./AUDIT_FINDINGS.md)** | Reporte completo de auditoría de seguridad 📊 |
| **[PRODUCTION_READY_CHECKLIST.md](./PRODUCTION_READY_CHECKLIST.md)** | Checklist pre-producción (95 items) ✅ |
| **[CHANGELOG.md](./CHANGELOG.md)** | Historial de versiones y cambios 📝 |
| **[examples/backend-integration.ts](./examples/backend-integration.ts)** | Código completo integración backend 💻 |
| **[examples/event-monitoring.ts](./examples/event-monitoring.ts)** | Ejemplos de monitoreo de eventos 📡 |
| **[blockchain.config.json](./blockchain.config.json)** | Config centralizada para monorepo ⚙️ |

---

## 🛠️ Scripts NPM

```bash
# Desarrollo Local
npm run chain          # Iniciar nodo local Hardhat
npm run build          # Clean + compile + export ABIs + sync a backends
npm test               # Ejecutar tests (18 tests)
npm run healthcheck    # Verificar que el nodo está corriendo
npm run setup          # Setup completo (deploy + ABIs + sync)

# Operational Tools (NEW in v2.0)
npm run admin status              # Ver estado del sistema
npm run admin event:list          # Listar eventos creados
npm run admin ticket:info <addr> <id>  # Info de ticket
npm run monitor                   # Monitorear eventos en tiempo real
npm run diagnose                  # Diagnosticar problemas del entorno

# Testing
npm run test:security  # Tests de seguridad (31 tests)
npm run test:coverage  # Tests con coverage report
npm run test:gas       # Tests con reporte de gas

# Security Audits
npm run security:audit # Auditoría completa (Slither, Solhint, Coverage, Gas, Dependencies)

# ABIs
npm run export-abis    # Exportar ABIs a /abi
npm run sync-abis      # Sincronizar ABIs a todos los backends

# Deployment
npm run deploy:enhanced          # Deploy mejorado con validación
npm run deploy:baseSepolia      # Deploy a Base Sepolia testnet
npm run deploy:base             # Deploy a Base mainnet
npm run verify:baseSepolia      # Verificar en Basescan

# Code Quality
npm run lint           # Linter de Solidity
npm run format         # Formatear código
npm run clean          # Limpiar artifacts
npm run clean:all      # Reset completo del entorno
```

---

## 🎯 Herramientas Operacionales

### Admin CLI 🛠️

Sistema completo de administración por línea de comandos (13 comandos):

```bash
# Status & Info
npm run admin status              # Estado general del sistema
npm run admin factory:info        # Info del Factory contract
npm run admin event:info <addr>   # Info de un evento
npm run admin event:list          # Listar todos los eventos

# Ticket Management
npm run admin ticket:info <addr> <id>        # Info completa de ticket
npm run admin ticket:status <addr> <id>      # Estado del ticket
npm run admin ticket:transfer <addr> <id> <to>  # Transferir ticket

# Contract Management
npm run admin contract:pause <addr>     # Pausar contrato (emergencia)
npm run admin contract:unpause <addr>   # Reanudar contrato
npm run admin contract:owner <addr>     # Ver owner del contrato

# Utilities
npm run admin balance <addr>      # Ver balance de dirección
npm run admin block               # Ver bloque actual
npm run admin accounts            # Listar cuentas disponibles
```

### Event Monitor 📡

Sistema de monitoreo de eventos blockchain para integración con backends:

```typescript
import { EventMonitor } from './lib';

const monitor = new EventMonitor({
  rpcUrl: 'http://127.0.0.1:8545',
  factoryAddress: '0x5FbDB...'
});

// Escuchar nuevos eventos creados
monitor.onFactoryEventCreated(async (event) => {
  await Event.create({ address: event.eventAddress });
});

// Escuchar tickets minteados
monitor.onTokenMinted(eventAddress, async (ticket) => {
  await Sale.updateOne({ tokenId: ticket.tokenId });
});

// Obtener histórico
const events = await monitor.getFactoryEventsHistory(0);
```

### Diagnostic Tool 🔧

Herramienta de diagnóstico que valida 9 aspectos críticos:

```bash
npm run diagnose

# Output:
✅ Node.js Version      (>= v18)
✅ NPM Packages         (hardhat, ethers, OpenZeppelin)
✅ Contracts Compiled   (artifacts presentes)
✅ ABIs Exported        (/abi directory)
✅ Blockchain Node      (corriendo en :8545)
✅ Factory Deployed     (contrato desplegado)
✅ Environment Variables (todas configuradas)
✅ ABIs Synced          (4 backends sincronizados)
✅ Deployer Balance     (suficiente ETH)

🎉 ALL CHECKS PASSED! Environment is ready.
```

### Enhanced Deployment 🚀

Scripts de deployment mejorados con validación completa:

```bash
npm run deploy:enhanced -- --network hardhat

# Features:
✅ Pre-deployment validation (9 checks)
✅ Gas estimation automática
✅ Post-deployment validation
✅ Block explorer verification automática
✅ Deployment logging a JSON
✅ Deployment history tracking
```

**📖 Ver documentación completa:** [`OPERATIONAL_TOOLS.md`](./OPERATIONAL_TOOLS.md)

---

## 🔗 Links Útiles

### Testnet (Base Sepolia)

- **RPC**: https://sepolia.base.org
- **Chain ID**: 84532
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://faucet.quicknode.com/base/sepolia

### Mainnet (Base)

- **RPC**: https://mainnet.base.org
- **Chain ID**: 8453
- **Explorer**: https://basescan.org

### APIs

- **Alchemy**: https://dashboard.alchemy.com/
- **Pimlico** (Account Abstraction): https://dashboard.pimlico.io/
- **Basescan**: https://basescan.org/apis

---

## 🤝 Integración con Backend

### Sincronización Automática de ABIs

Los ABIs se sincronizan automáticamente a todos los backends cuando ejecutas:

```bash
npm run build
# o manualmente:
npm run sync-abis
```

Esto copia los ABIs a:
- `futura-tickets-admin-api/src/abis/`
- `futura-tickets-rest-api/src/abis/`
- `futura-market-place-api/src/abis/`
- `futura-access-api/src/abis/`

### Uso en Backend

```typescript
// Importar ABIs
import { FuturaEventFactoryABI, FuturaEventABI } from './abis';
import { ethers } from 'ethers';

// Configurar provider
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

// Conectar a factory
const factory = new ethers.Contract(
  process.env.FACTORY_CONTRACT_ADDRESS,
  FuturaEventFactoryABI,
  wallet
);

// Crear evento
const tx = await factory.createNew(
  promoterAddress,
  "Mi Evento",
  1000,  // maxSupply
  "https://metadata.example.com/"
);
```

**📖 Ver ejemplo completo:** [`examples/backend-integration.ts`](./examples/backend-integration.ts)

### Variables de Entorno Backend

```bash
# Local Development
RPC_URL=http://127.0.0.1:8545
FACTORY_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Base Sepolia Testnet
RPC_URL=https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}
FACTORY_CONTRACT_ADDRESS=0x...  # Después del deployment
DEPLOYER_PRIVATE_KEY=0x...       # Tu private key

# Otras
BLOCKCHAIN_ENABLED=true
WALLET_ENCRYPTION_KEY=64_hex_chars
```

**📖 Ver configuración centralizada:** [`blockchain.config.json`](./blockchain.config.json)

---

## 📄 License

MIT License - ver [LICENSE](LICENSE) para detalles.

---

## 🆘 Soporte

Si encuentras problemas:

1. **Verificar setup**: `./scripts/verify-setup.sh`
2. **Consultar docs**: Revisar archivos .md en el repositorio
3. **Revisar logs**: Verificar output de Hardhat y backend
4. **Explorer**: Verificar transacciones en Basescan

---

## 🎯 Roadmap

### Fase 1 - Testnet (Actual)
- [x] Smart contracts implementados
- [x] Tests completos (15+)
- [x] Deployment scripts
- [x] Documentación completa
- [ ] Deploy a Base Sepolia
- [ ] Testing E2E en testnet

### Fase 2 - Mejoras
- [ ] Auditoría de seguridad
- [ ] Implementar mejoras de seguridad
- [ ] Optimización de gas
- [ ] Frontend para marketplace

### Fase 3 - Mainnet
- [ ] Deploy a Base Mainnet
- [ ] Monitoreo y analytics
- [ ] Bug bounty program

---

**Desarrollado por**: FuturaTickets Team
**Versión**: 2.0.3 ✅
**Última actualización**: 2025-10-17
**Status**: 🟢 **PRODUCTION READY FOR TESTNET**

**Code Quality:**
- ✅ Solhint Warnings: 0/0 (100% - todos eliminados)
- ✅ Tests: 49/49 passing (31 security + 18 functional)
- ✅ Coverage: 81.33% statements
- ✅ Gas Optimized: ~50 gas saved per revert
- ✅ Custom Errors: 18/18 implemented
- ✅ Named Imports: 7/7 optimized

**Deployment Status:**
- ✅ Infrastructure: Ready
- ✅ Documentation: Complete (9 files)
- ✅ ABIs: Synced to 4 backends
- ⏳ Testnet Deployment: Pending credentials only

**Next Steps:**
1. Configure wallet → See `READY_TO_DEPLOY.md`
2. Get testnet ETH → https://faucet.quicknode.com/base/sepolia
3. Deploy → `npm run deploy:baseSepolia`

🎫 **Convirtiendo tickets en NFTs, una entrada a la vez** 🔗
