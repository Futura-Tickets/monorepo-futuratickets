# FUTURA TICKETS CONTRACTS V2 - DOCUMENTACIÓN TÉCNICA COMPLETA

> **Repositorio:** `futura-tickets-contracts-v2-main`
> **Tipo:** Smart Contracts (Solidity)
> **Propósito:** Contratos inteligentes para la emisión y gestión de tickets NFT en blockchain
> **Versión:** 1.0.0
> **Estado:** En desarrollo

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura de Contratos](#2-arquitectura-de-contratos)
3. [Estructura del Proyecto](#3-estructura-del-proyecto)
4. [Contratos Inteligentes](#4-contratos-inteligentes)
5. [Funciones y Métodos](#5-funciones-y-métodos)
6. [Eventos Blockchain](#6-eventos-blockchain)
7. [Seguridad y Permisos](#7-seguridad-y-permisos)
8. [Estados del Ticket](#8-estados-del-ticket)
9. [Flujos de Negocio](#9-flujos-de-negocio)
10. [Integración con Backend](#10-integración-con-backend)
11. [Deployment](#11-deployment)
12. [Mejoras Pendientes](#12-mejoras-pendientes)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Propósito
Sistema de contratos inteligentes basado en **Solidity 0.8.25** para la plataforma FuturaTickets que implementa la emisión, gestión y transferencia de tickets como NFTs (Non-Fungible Tokens) siguiendo el estándar **ERC-721**.

### 1.2 Responsabilidades Principales
- ✅ **Emisión de Tickets NFT**: Minteo de tokens únicos por evento
- ✅ **Gestión de Propiedad**: Transferencias seguras de tickets
- ✅ **Mercado Secundario**: Precios de reventa con royalties
- ✅ **Control de Acceso**: Estados de tickets (OPEN, CLOSED, SALE)
- ✅ **Factory Pattern**: Creación dinámica de contratos por evento
- ✅ **Royalties**: Porcentaje configurable para el creador original

### 1.3 Componentes del Sistema
```
┌─────────────────────────────────────────────────┐
│          BLOCKCHAIN LAYER (Polygon)             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │   FuturaEventFactory.sol               │    │
│  │   (Contrato Factory)                   │    │
│  │                                        │    │
│  │   - createNew(owner, eventName)        │    │
│  │   - Emit: FuturaEventCreated           │    │
│  └──────────────┬─────────────────────────┘    │
│                 │ deploys                       │
│                 ▼                               │
│  ┌────────────────────────────────────────┐    │
│  │   FuturaEvent.sol (por cada evento)    │    │
│  │   ERC-721 Contract                     │    │
│  │                                        │    │
│  │   - mintNFT()                          │    │
│  │   - setNFTPrice()                      │    │
│  │   - transferNFT()                      │    │
│  │   - setTicketStatus()                  │    │
│  │   - cancelResale()                     │    │
│  └────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA DE CONTRATOS

### 2.1 Diagrama de Relaciones

```
┌───────────────────────────────────────────────────┐
│            FuturaEventFactory                     │
│  (Único contrato desplegado manualmente)         │
├───────────────────────────────────────────────────┤
│                                                   │
│  function createNew(owner, eventName)             │
│    └─> new FuturaEvent(owner, eventName)         │
│    └─> emit FuturaEventCreated(address)          │
│                                                   │
└────────────────┬──────────────────────────────────┘
                 │
                 │ Deploys N contratos
                 │
    ┌────────────┴────────────┬──────────────┐
    │                         │              │
    ▼                         ▼              ▼
┌─────────────┐      ┌─────────────┐   ┌─────────────┐
│ FuturaEvent │      │ FuturaEvent │   │ FuturaEvent │
│  (Evento A) │      │  (Evento B) │   │  (Evento C) │
├─────────────┤      ├─────────────┤   ├─────────────┤
│ NFTs 1..N   │      │ NFTs 1..M   │   │ NFTs 1..P   │
└─────────────┘      └─────────────┘   └─────────────┘
```

### 2.2 Patrón de Diseño: Factory

**Ventajas del Factory Pattern:**
1. **Escalabilidad**: Cada evento tiene su propio contrato aislado
2. **Independencia**: Fallos en un evento no afectan a otros
3. **Gas Efficiency**: Solo se despliega lo necesario
4. **Flexibilidad**: Cada evento puede tener configuraciones únicas
5. **Tracking**: Fácil rastreo de eventos creados vía `FuturaEventCreated`

---

## 3. ESTRUCTURA DEL PROYECTO

```
futura-tickets-contracts-v2-main/
├── FuturaEvent.sol              # Contrato principal ERC-721
├── FuturaEventFactory.sol       # Factory para crear instancias
├── package.json                 # Metadatos del proyecto
├── package-lock.json            # Lock file (vacío)
└── .DS_Store                    # Metadata macOS
```

### 3.1 Dependencias

```json
{
  "name": "futura-tickets-contracts",
  "version": "1.0.0",
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0"  // Implícita, no en package.json
  }
}
```

**Nota**: El proyecto requiere OpenZeppelin Contracts para ERC-721, Ownable y Counters.

---

## 4. CONTRATOS INTELIGENTES

### 4.1 FuturaEvent.sol

#### Herencia

```solidity
contract FuturaEvent is ERC721, Ownable
```

**ERC721**: Estándar de NFT (Non-Fungible Token)
- Implementa propiedad única de tokens
- Transferencias seguras
- Aprobaciones y operadores

**Ownable**: Control de acceso
- Modificador `onlyOwner` para funciones privilegiadas
- Transferencia de ownership

#### State Variables

```solidity
using Counters for Counters.Counter;
Counters.Counter private _tokenIds;  // Auto-incremento de IDs
```

#### Enums

```solidity
enum TicketStatus {
    OPEN,     // Ticket válido para acceso
    CLOSED,   // Ticket ya usado (check-in realizado)
    SALE      // Ticket en venta secundaria
}
```

#### Structs

```solidity
struct NFTDetail {
    uint256 price;              // Precio actual del ticket
    address creator;            // Dirección del creador original
    uint256 royaltyPercentage;  // Porcentaje de royalty (0-100)
    TicketStatus status;        // Estado del ticket
}
```

#### Storage

```solidity
mapping(uint256 => NFTDetail) public nftDetails;  // tokenId => detalles
```

---

### 4.2 FuturaEventFactory.sol

#### Función Principal

```solidity
function createNew(address owner, string memory eventName) public {
    FuturaEvent futuraEvent = new FuturaEvent(owner, eventName);
    emit FuturaEventCreated(address(futuraEvent));
}
```

**Parámetros:**
- `owner`: Dirección del promotor que será el dueño del contrato
- `eventName`: Nombre del evento (usado como nombre del NFT)

**Retorno:**
- Emite evento `FuturaEventCreated(address)` con la dirección del nuevo contrato

---

## 5. FUNCIONES Y MÉTODOS

### 5.1 Constructor

```solidity
constructor(address owner, string memory eventName)
    Ownable(owner)
    ERC721(eventName, "TKT")
{}
```

**Parámetros:**
- `owner`: Dirección del propietario inicial (promotor)
- `eventName`: Nombre del evento (también nombre del NFT)

**Símbolo del Token:** `TKT` (constante)

---

### 5.2 mintNFT() - Emisión de Tickets

```solidity
function mintNFT(
    uint256 price,
    address client,
    uint256 royaltyPercentage,
    uint256 timeStamp,
    TicketStatus status
) public onlyOwner
```

**Descripción:** Crea un nuevo NFT (ticket) y lo asigna al cliente.

**Parámetros:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `price` | uint256 | Precio inicial del ticket (en Wei) |
| `client` | address | Dirección del comprador del ticket |
| `royaltyPercentage` | uint256 | Porcentaje de royalty (0-100) |
| `timeStamp` | uint256 | Timestamp de la compra (para evento) |
| `status` | TicketStatus | Estado inicial (normalmente OPEN) |

**Validaciones:**
- ✅ Solo el owner puede ejecutar (`onlyOwner`)
- ✅ `royaltyPercentage <= 100`

**Flujo:**
1. Incrementa contador `_tokenIds`
2. Genera nuevo `tokenId` único
3. Hace mint del NFT a la dirección del cliente
4. Almacena detalles en `nftDetails[tokenId]`
5. Emite evento `TokenMinted`

**Evento Emitido:**
```solidity
emit TokenMinted(client, timeStamp, tokenId);
```

---

### 5.3 setNFTPrice() - Establecer Precio de Reventa

```solidity
function setNFTPrice(uint256 tokenId, uint256 price) public
```

**Descripción:** Permite al propietario actual establecer un precio de reventa.

**Validaciones:**
- ✅ `msg.sender == ownerOf(tokenId)`

**Flujo:**
1. Verifica que el caller sea el dueño del NFT
2. Actualiza solo el campo `price` en `nftDetails`
3. Mantiene otros campos (creator, royalty, status)
4. Emite evento `TokenPriced`

**Uso típico:**
```solidity
// Usuario quiere revender su ticket por 150 MATIC
setNFTPrice(tokenId, 150 ether);
```

---

### 5.4 cancelResale() - Cancelar Reventa

```solidity
function cancelResale(uint256 tokenId) public
```

**Descripción:** Cancela la venta secundaria eliminando los detalles del NFT.

**Validaciones:**
- ✅ `msg.sender == ownerOf(tokenId)`

**Flujo:**
1. Verifica propiedad
2. Elimina entrada en `nftDetails[tokenId]`
3. Emite evento `TokenCancel`

⚠️ **PROBLEMA POTENCIAL**:
Eliminar los detalles puede causar pérdida de información crítica (royalty, creator). Debería solo actualizar el status a OPEN.

**Mejora recomendada:**
```solidity
function cancelResale(uint256 tokenId) public {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
    NFTDetail storage nft = nftDetails[tokenId];
    nft.status = TicketStatus.OPEN;  // Solo cambiar status
    emit TokenCancel(tokenId);
}
```

---

### 5.5 transferNFT() - Transferir Ticket

```solidity
function transferNFT(uint256 tokenId, address owner) public
```

**Descripción:** Transfiere la propiedad del NFT a otra dirección.

**Validaciones:**
- ✅ `msg.sender == ownerOf(tokenId)`

**Flujo:**
1. Verifica propiedad actual
2. Ejecuta `_transfer(msg.sender, owner, tokenId)`

**Uso típico:**
```solidity
// Transferir ticket a otro usuario (regalo/reventa)
transferNFT(tokenId, 0xRecipientAddress);
```

⚠️ **NOTA**: No emite evento personalizado, solo el estándar `Transfer` de ERC-721.

---

### 5.6 setTicketStatus() - Cambiar Estado

```solidity
function setTicketStatus(TicketStatus ticketStatus, uint256 tokenId) public
```

**Descripción:** Actualiza el estado del ticket (OPEN/CLOSED/SALE).

**Validaciones:**
- ✅ `msg.sender == ownerOf(tokenId)`

**Flujo:**
1. Verifica propiedad
2. Lee detalles actuales
3. Actualiza solo el campo `status`
4. Mantiene price, creator y royalty

**Casos de uso:**
```solidity
// Marcar ticket como usado (check-in)
setTicketStatus(TicketStatus.CLOSED, tokenId);

// Poner en venta secundaria
setTicketStatus(TicketStatus.SALE, tokenId);

// Sacar de venta
setTicketStatus(TicketStatus.OPEN, tokenId);
```

---

## 6. EVENTOS BLOCKCHAIN

### 6.1 Eventos en FuturaEvent

#### TokenMinted
```solidity
event TokenMinted(
    address indexed client,
    uint256 indexed timeStamp,
    uint256 indexed tokenId
);
```
**Emitido:** Al crear un nuevo ticket NFT
**Parámetros indexados:** client, timeStamp, tokenId (optimiza búsquedas)

#### TokenPriced
```solidity
event TokenPriced(
    uint256 indexed tokenId,
    uint256 indexed price
);
```
**Emitido:** Al establecer/actualizar precio de reventa
**Uso:** Tracking de mercado secundario

#### TokenCancel
```solidity
event TokenCancel(uint256 indexed tokenId);
```
**Emitido:** Al cancelar una reventa
**Uso:** Sincronización con backend

### 6.2 Eventos en FuturaEventFactory

#### FuturaEventCreated
```solidity
event FuturaEventCreated(address indexed _address);
```
**Emitido:** Al desplegar un nuevo contrato de evento
**Uso:** El backend escucha este evento para registrar la dirección del contrato

---

## 7. SEGURIDAD Y PERMISOS

### 7.1 Control de Acceso

#### Modificador onlyOwner

```solidity
function mintNFT(...) public onlyOwner
```

**Funciones restringidas:**
- ✅ `mintNFT()` - Solo el promotor (owner) puede emitir tickets

**Funciones públicas:**
- ✅ `setNFTPrice()` - Cualquier dueño de ticket
- ✅ `cancelResale()` - Cualquier dueño de ticket
- ✅ `transferNFT()` - Cualquier dueño de ticket
- ✅ `setTicketStatus()` - Cualquier dueño de ticket

### 7.2 Validaciones de Seguridad

#### Verificación de Propiedad
```solidity
require(ownerOf(tokenId) == msg.sender, "Not the owner");
```
Presente en todas las funciones que modifican NFTs.

#### Validación de Royalty
```solidity
require(royaltyPercentage <= 100, "Royalty percentage too high");
```
Previene valores inválidos de porcentaje.

### 7.3 Vulnerabilidades Potenciales ⚠️

#### 1. Falta de Re-entrancy Guard
```solidity
// VULNERABLE: No protección contra re-entrancy
function transferNFT(uint256 tokenId, address owner) public {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
    _transfer(msg.sender, owner, tokenId);
}
```

**Solución:** Usar `ReentrancyGuard` de OpenZeppelin.

#### 2. Pérdida de Datos en cancelResale
```solidity
delete nftDetails[tokenId];  // ❌ Elimina toda la información
```

**Impacto:** Se pierden royalty, creator, price.

**Solución:** Solo actualizar el status.

#### 3. Falta de Pausa de Emergencia
No hay función para pausar operaciones en caso de exploit.

**Solución:** Implementar `Pausable` de OpenZeppelin.

#### 4. Sin Límite de Minteo
No hay `maxSupply` definido, permitiendo mint infinito.

---

## 8. ESTADOS DEL TICKET

### 8.1 Diagrama de Estados

```
┌─────────────────────────────────────────────────┐
│           TICKET LIFECYCLE                      │
└─────────────────────────────────────────────────┘

    [MINTEO]
       │
       ▼
   ┌────────┐
   │  OPEN  │ ← Estado inicial después del mint
   └───┬────┘
       │
       ├───────► [Usuario pone en venta] ────► ┌──────┐
       │                                        │ SALE │
       │                                        └───┬──┘
       │                                            │
       │                                            │
       │            [Cancela venta] ◄───────────────┘
       │                 │
       │                 ▼
       │              OPEN
       │
       │
       └───────► [Check-in en evento] ────► ┌────────┐
                                             │ CLOSED │
                                             └────────┘
                                                (Final)
```

### 8.2 Transiciones Válidas

| Estado Actual | Acción | Estado Final | Función |
|---------------|--------|--------------|---------|
| OPEN | Poner en venta | SALE | `setTicketStatus(SALE, tokenId)` |
| SALE | Cancelar venta | OPEN | `cancelResale(tokenId)` |
| OPEN | Check-in evento | CLOSED | `setTicketStatus(CLOSED, tokenId)` |
| SALE | Check-in evento | CLOSED | `setTicketStatus(CLOSED, tokenId)` |

⚠️ **NOTA**: No hay validación de transiciones inválidas en el contrato.

---

## 9. FLUJOS DE NEGOCIO

### 9.1 Flujo de Compra de Ticket

```
BACKEND                          BLOCKCHAIN
   │                                 │
   │  1. Usuario compra ticket       │
   │     (pago con Stripe)           │
   │                                 │
   │  2. createNew(owner, eventName) │
   │     (solo primera vez)          │
   ├────────────────────────────────►│
   │                                 │
   │                          FuturaEventFactory
   │                          │
   │◄─────────────────────────┤ emit FuturaEventCreated(address)
   │  3. Guarda contract      │
   │     address en BD        │
   │                          │
   │  4. mintNFT(             │
   │      price,              │
   │      clientAddress,      │
   │      royalty,            │
   │      timestamp,          │
   │      OPEN                │
   │    )                     │
   ├────────────────────────►│
   │                          │ FuturaEvent.mintNFT()
   │                          │ │
   │                          │ ├─> _tokenIds.increment()
   │                          │ ├─> _mint(client, tokenId)
   │                          │ ├─> nftDetails[tokenId] = {...}
   │                          │ └─> emit TokenMinted(...)
   │                          │
   │◄─────────────────────────┤ Devuelve tokenId
   │                          │
   │  5. Guarda tokenId       │
   │     en Sales BD          │
   │                          │
   │  6. Genera QR code       │
   │     con tokenId          │
   │                          │
   │  7. Envía email          │
   │     con ticket           │
   │                          │
```

### 9.2 Flujo de Reventa

```
FRONTEND                    BACKEND                    BLOCKCHAIN
   │                          │                           │
   │  Usuario quiere          │                           │
   │  revender ticket         │                           │
   │                          │                           │
   │  resaleSale(saleId,      │                           │
   │            resalePrice)  │                           │
   ├─────────────────────────►│                           │
   │                          │                           │
   │                          │  1. Valida ownership      │
   │                          │     en BD                 │
   │                          │                           │
   │                          │  2. setTicketStatus(      │
   │                          │      SALE, tokenId)       │
   │                          ├──────────────────────────►│
   │                          │                           │
   │                          │                  FuturaEvent
   │                          │                  │
   │                          │◄─────────────────┤ Status actualizado
   │                          │                  │
   │                          │  3. setNFTPrice(          │
   │                          │      tokenId, resalePrice)│
   │                          ├──────────────────────────►│
   │                          │                           │
   │                          │                  emit TokenPriced(...)
   │                          │                           │
   │                          │  4. Actualiza BD          │
   │                          │     - sale.status = SALE  │
   │                          │     - sale.resale.price   │
   │                          │                           │
   │◄─────────────────────────┤  Success response         │
   │                          │                           │
```

### 9.3 Flujo de Check-in

```
ACCESS APP              ACCESS API                BLOCKCHAIN
   │                       │                          │
   │  1. Escanea QR        │                          │
   │     (tokenId)         │                          │
   │                       │                          │
   │  PATCH /events/access │                          │
   │  { sale: saleId }     │                          │
   ├──────────────────────►│                          │
   │                       │                          │
   │                       │  2. Busca sale en BD     │
   │                       │     - tokenId            │
   │                       │     - event address      │
   │                       │                          │
   │                       │  3. Verifica status      │
   │                       │     en BD                │
   │                       │                          │
   │                       │  4. setTicketStatus(     │
   │                       │      CLOSED, tokenId)    │
   │                       ├─────────────────────────►│
   │                       │                          │
   │                       │                   FuturaEvent
   │                       │                   │
   │                       │                   └─> status = CLOSED
   │                       │                          │
   │                       │◄─────────────────────────┤
   │                       │                          │
   │                       │  5. Actualiza BD         │
   │                       │     sale.status = CLOSED │
   │                       │                          │
   │◄──────────────────────┤  { access: "GRANTED" }   │
   │                       │                          │
```

---

## 10. INTEGRACIÓN CON BACKEND

### 10.1 APIs Backend que Interactúan

#### futura-tickets-rest-api
**Responsabilidad:** Crear eventos y emitir tickets

```typescript
// 1. Crear contrato de evento (primera vez)
const tx = await factoryContract.createNew(promoterAddress, eventName);
const receipt = await tx.wait();
const eventAddress = receipt.events[0].args._address;

// 2. Guardar address en BD
await Event.updateOne({ _id: eventId }, { address: eventAddress });

// 3. Mintear tickets después de compra
const eventContract = new ethers.Contract(eventAddress, FuturaEventABI, signer);
const tx = await eventContract.mintNFT(
  ethers.utils.parseEther(price.toString()),
  clientAddress,
  royaltyPercentage,
  Date.now(),
  0  // TicketStatus.OPEN
);
const receipt = await tx.wait();
const tokenId = receipt.events[0].args.tokenId;

// 4. Guardar tokenId en Sale
await Sale.updateOne({ _id: saleId }, {
  tokenId,
  blockNumber: receipt.blockNumber,
  hash: receipt.transactionHash
});
```

#### futura-tickets-admin-api
**Responsabilidad:** Gestionar eventos y configuraciones

```typescript
// Configurar royalty al crear evento
const royaltyPercentage = 5; // 5%
```

#### futura-tickets-access-api
**Responsabilidad:** Check-in y validación

```typescript
// Marcar ticket como usado (CLOSED)
const eventContract = new ethers.Contract(event.address, FuturaEventABI, signer);
await eventContract.setTicketStatus(1, tokenId);  // 1 = CLOSED
```

#### futura-market-place-api / REFACTOR_RESALE_API
**Responsabilidad:** Mercado secundario

```typescript
// Poner en venta
await eventContract.setTicketStatus(2, tokenId);  // 2 = SALE
await eventContract.setNFTPrice(tokenId, ethers.utils.parseEther(resalePrice));

// Cancelar venta
await eventContract.cancelResale(tokenId);
```

### 10.2 Eventos Blockchain Escuchados

```typescript
// Backend escucha eventos del factory
factoryContract.on("FuturaEventCreated", (address) => {
  console.log(`Nuevo contrato creado: ${address}`);
  // Guardar en BD
});

// Backend escucha eventos de cada contrato de evento
eventContract.on("TokenMinted", (client, timeStamp, tokenId) => {
  console.log(`Ticket ${tokenId} emitido para ${client}`);
  // Actualizar BD con tokenId
});

eventContract.on("TokenPriced", (tokenId, price) => {
  console.log(`Ticket ${tokenId} precio: ${price}`);
  // Actualizar precio en BD
});
```

### 10.3 Variables de Entorno Necesarias

```bash
# Blockchain
BLOCKCHAIN_PROVIDER_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
FACTORY_CONTRACT_ADDRESS=0x...
DEPLOYER_PRIVATE_KEY=0x...

# Gas Configuration
GAS_LIMIT=500000
MAX_FEE_PER_GAS=50
MAX_PRIORITY_FEE_PER_GAS=2
```

---

## 11. DEPLOYMENT

### 11.1 Prerequisitos

```bash
# Instalar Hardhat o Truffle
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Instalar OpenZeppelin
npm install @openzeppelin/contracts
```

### 11.2 Script de Deployment (Hardhat)

```javascript
// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // 1. Deploy Factory (una sola vez)
  const FuturaEventFactory = await hre.ethers.getContractFactory("FuturaEventFactory");
  const factory = await FuturaEventFactory.deploy();
  await factory.deployed();

  console.log("FuturaEventFactory deployed to:", factory.address);

  // 2. Verificar en Polygonscan
  await hre.run("verify:verify", {
    address: factory.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 11.3 Configuración Hardhat

```javascript
// hardhat.config.js
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");

module.exports = {
  solidity: {
    version: "0.8.25",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 137
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 80001
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY
  }
};
```

### 11.4 Comando de Deployment

```bash
# Deploy en testnet (Mumbai)
npx hardhat run scripts/deploy.js --network mumbai

# Deploy en mainnet (Polygon)
npx hardhat run scripts/deploy.js --network polygon
```

### 11.5 Gas Costs Estimados (Polygon)

| Operación | Gas Estimado | Costo (0.5 MATIC/gas) |
|-----------|--------------|------------------------|
| Deploy Factory | ~1,500,000 | ~0.75 MATIC |
| createNew (crear evento) | ~2,000,000 | ~1.00 MATIC |
| mintNFT | ~150,000 | ~0.075 MATIC |
| setNFTPrice | ~50,000 | ~0.025 MATIC |
| setTicketStatus | ~50,000 | ~0.025 MATIC |
| transferNFT | ~70,000 | ~0.035 MATIC |

---

## 12. MEJORAS PENDIENTES

### 12.1 Prioridad Alta 🔴

#### Seguridad

1. **Implementar ReentrancyGuard**
```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract FuturaEvent is ERC721, Ownable, ReentrancyGuard {
    function transferNFT(...) public nonReentrant { ... }
}
```

2. **Implementar Pausable**
```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract FuturaEvent is ERC721, Ownable, Pausable {
    function mintNFT(...) public onlyOwner whenNotPaused { ... }
}
```

3. **Corregir cancelResale()**
```solidity
function cancelResale(uint256 tokenId) public {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
    nftDetails[tokenId].status = TicketStatus.OPEN;
    nftDetails[tokenId].price = 0;  // Reset precio
    emit TokenCancel(tokenId);
}
```

#### Funcionalidad

4. **Agregar maxSupply**
```solidity
uint256 public immutable maxSupply;

constructor(..., uint256 _maxSupply) {
    maxSupply = _maxSupply;
}

function mintNFT(...) public onlyOwner {
    require(_tokenIds.current() < maxSupply, "Max supply reached");
    // ...
}
```

5. **Implementar Royalty Standard (ERC-2981)**
```solidity
import "@openzeppelin/contracts/token/common/ERC2981.sol";

contract FuturaEvent is ERC721, ERC2981, Ownable {
    function mintNFT(...) public onlyOwner {
        // ...
        _setTokenRoyalty(newTokenId, creator, royaltyPercentage * 100);
    }
}
```

---

### 12.2 Prioridad Media 🟡

#### Mejoras de Código

6. **Usar storage en lugar de memory**
```solidity
// Optimización de gas
function setTicketStatus(...) public {
    NFTDetail storage nft = nftDetails[tokenId];  // ✅ storage
    nft.status = ticketStatus;
    // No necesita copiar toda la estructura
}
```

7. **Eventos más completos**
```solidity
event TokenStatusChanged(
    uint256 indexed tokenId,
    TicketStatus oldStatus,
    TicketStatus newStatus,
    uint256 timestamp
);
```

8. **Validar transiciones de estado**
```solidity
function setTicketStatus(TicketStatus newStatus, uint256 tokenId) public {
    TicketStatus currentStatus = nftDetails[tokenId].status;

    // CLOSED es estado terminal
    require(currentStatus != TicketStatus.CLOSED, "Ticket already closed");

    // No se puede ir de SALE a CLOSED sin comprador
    require(
        !(currentStatus == TicketStatus.SALE && newStatus == TicketStatus.CLOSED),
        "Invalid transition: SALE to CLOSED"
    );

    // ...
}
```

#### Funcionalidades Nuevas

9. **Batch Minting**
```solidity
function mintNFTBatch(
    MintParams[] calldata params
) public onlyOwner {
    for (uint256 i = 0; i < params.length; i++) {
        mintNFT(params[i].price, params[i].client, ...);
    }
}
```

10. **Metadata URI**
```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
}
```

---

### 12.3 Prioridad Baja 🟢

#### Optimizaciones

11. **Reducir almacenamiento**
```solidity
// Comprimir royaltyPercentage a uint8 (0-100)
struct NFTDetail {
    uint256 price;
    address creator;
    uint8 royaltyPercentage;  // uint8 en lugar de uint256
    TicketStatus status;
}
```

12. **Gas Reporter**
```bash
npm install hardhat-gas-reporter
```

#### Testing

13. **Suite de tests completa**
```javascript
describe("FuturaEvent", () => {
  it("Should mint NFT correctly", async () => {});
  it("Should revert if royalty > 100", async () => {});
  it("Should transfer NFT ownership", async () => {});
  it("Should not allow non-owner to mint", async () => {});
});
```

14. **Coverage Report**
```bash
npm install solidity-coverage
npx hardhat coverage
```

---

## 13. DIAGRAMAS TÉCNICOS

### 13.1 Flujo Completo de Compra

```
┌──────────┐      ┌──────────┐      ┌────────────┐      ┌────────────┐
│  USUARIO │      │ FRONTEND │      │  BACKEND   │      │ BLOCKCHAIN │
└────┬─────┘      └────┬─────┘      └─────┬──────┘      └─────┬──────┘
     │                 │                   │                   │
     │ Compra ticket   │                   │                   │
     ├────────────────►│                   │                   │
     │                 │ POST /orders      │                   │
     │                 ├──────────────────►│                   │
     │                 │                   │ Stripe Payment    │
     │                 │                   ├──────┐            │
     │                 │                   │◄─────┘            │
     │                 │                   │                   │
     │                 │                   │ createNew()       │
     │                 │                   │ (si es 1er evento)│
     │                 │                   ├──────────────────►│
     │                 │                   │                   │
     │                 │                   │◄──────────────────┤
     │                 │                   │ contract address  │
     │                 │                   │                   │
     │                 │                   │ mintNFT()         │
     │                 │                   ├──────────────────►│
     │                 │                   │                   │
     │                 │                   │◄──────────────────┤
     │                 │                   │ tokenId           │
     │                 │                   │                   │
     │                 │                   │ Genera QR         │
     │                 │                   ├──────┐            │
     │                 │                   │◄─────┘            │
     │                 │                   │                   │
     │                 │◄──────────────────┤ Success           │
     │◄────────────────┤ Ticket            │                   │
     │  (con QR)       │                   │                   │
     │                 │                   │                   │
```

---

## 14. CONCLUSIONES Y RECOMENDACIONES

### 14.1 Fortalezas ✅

1. **Factory Pattern** bien implementado
2. **ERC-721 estándar** garantiza compatibilidad
3. **Código limpio** y legible
4. **Eventos blockchain** para tracking
5. **Royalties** implementados nativamente

### 14.2 Debilidades ⚠️

1. **Falta de tests** (0% coverage)
2. **Sin protección re-entrancy**
3. **Sin pausado de emergencia**
4. **cancelResale() destruye datos**
5. **Sin validación de transiciones de estado**
6. **No hay maxSupply**

### 14.3 Recomendaciones Inmediatas 🎯

#### Para Seguridad
1. ✅ Implementar `ReentrancyGuard`
2. ✅ Implementar `Pausable`
3. ✅ Auditoría de seguridad profesional
4. ✅ Bug bounty program

#### Para Funcionalidad
1. ✅ Corregir `cancelResale()`
2. ✅ Agregar `maxSupply`
3. ✅ Implementar ERC-2981 (Royalty Standard)
4. ✅ Batch minting

#### Para Testing
1. ✅ Suite completa de unit tests
2. ✅ Tests de integración
3. ✅ Fuzzing tests
4. ✅ Coverage > 80%

#### Para Deployment
1. ✅ Deploy en testnet (Mumbai) primero
2. ✅ Testing extensivo en testnet
3. ✅ Verificación en Polygonscan
4. ✅ Documentar addresses de contratos

---

## 15. RECURSOS Y REFERENCIAS

### 15.1 Documentación

- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ERC-721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Documentation](https://hardhat.org/docs)

### 15.2 Exploradores

- **Polygon Mainnet**: https://polygonscan.com/
- **Mumbai Testnet**: https://mumbai.polygonscan.com/

### 15.3 Tools

- **Remix IDE**: https://remix.ethereum.org/
- **Hardhat**: https://hardhat.org/
- **OpenZeppelin Wizard**: https://wizard.openzeppelin.com/

---

## ANEXOS

### A. ABI Export

```javascript
// Exportar ABI después de compilar
const FuturaEventABI = require("./artifacts/contracts/FuturaEvent.sol/FuturaEvent.json").abi;
const FuturaEventFactoryABI = require("./artifacts/contracts/FuturaEventFactory.sol/FuturaEventFactory.json").abi;
```

### B. Ejemplo de Interacción con ethers.js

```javascript
const { ethers } = require("ethers");

// Setup provider y wallet
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Conectar al factory
const factory = new ethers.Contract(FACTORY_ADDRESS, FuturaEventFactoryABI, wallet);

// Crear nuevo evento
const tx = await factory.createNew(promoterAddress, "Concierto Rock 2025");
const receipt = await tx.wait();

// Obtener dirección del contrato creado
const eventAddress = receipt.events[0].args._address;

// Conectar al contrato del evento
const event = new ethers.Contract(eventAddress, FuturaEventABI, wallet);

// Mintear ticket
const mintTx = await event.mintNFT(
  ethers.utils.parseEther("0.1"),  // 0.1 MATIC
  clientAddress,
  5,  // 5% royalty
  Date.now(),
  0  // OPEN
);
const mintReceipt = await mintTx.wait();
const tokenId = mintReceipt.events[0].args.tokenId;

console.log(`Ticket NFT ${tokenId} creado para ${clientAddress}`);
```

---

**FIN DEL DOCUMENTO**

---

**Proyecto:** FuturaTickets Smart Contracts
**Tecnología:** Solidity 0.8.25 + OpenZeppelin + ERC-721
**Blockchain:** Polygon (compatible con Ethereum)
**Documentación actualizada:** 2025-10-10
