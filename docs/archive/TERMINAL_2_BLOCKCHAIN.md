# ⛓️ TERMINAL 2: BLOCKCHAIN

## Hardhat Local Ethereum Node

### 🚀 Inicio Rápido

```bash
./start-blockchain.sh
```

Este script inicia un nodo Ethereum local con Hardhat.

---

## 🌐 Información del Nodo

| Parámetro | Valor |
|-----------|-------|
| **Puerto** | 8545 |
| **URL** | http://localhost:8545 |
| **Chain ID** | 31337 |
| **Network** | Hardhat Local |
| **Cuentas** | 20 pre-funded accounts |

---

## 📦 Estructura

```
futura-tickets-contracts-v2/    → Hardhat + Smart Contracts
├── contracts/                   → Solidity contracts
├── scripts/                     → Deployment scripts
├── test/                        → Contract tests
├── hardhat.config.js           → Hardhat configuration
└── package.json                → Dependencies
```

---

## 🛠️ Comandos Útiles

### ✅ Verificar que Hardhat está corriendo
```bash
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

**Respuesta esperada**:
```json
{"jsonrpc":"2.0","id":1,"result":"0x0"}
```

### 🛑 Detener Hardhat Node
```bash
# Opción 1: Por puerto
kill -9 $(lsof -ti:8545)

# Opción 2: Por proceso
pkill -f "hardhat node"

# Opción 3: Todo el stack
./stop-all-stack.sh
```

### 🔍 Ver logs del nodo
```bash
# Si se inició con el script, los logs están en la terminal
# Si se inició en background:
ps aux | grep hardhat
```

### 📋 Listar cuentas pre-funded
```bash
cd futura-tickets-contracts-v2
npx hardhat accounts
```

### 🧪 Ejecutar tests de contratos
```bash
cd futura-tickets-contracts-v2
npx hardhat test
```

### 🚀 Compilar contratos
```bash
cd futura-tickets-contracts-v2
npx hardhat compile
```

### 📝 Deploy de contratos (local)
```bash
cd futura-tickets-contracts-v2
npx hardhat run scripts/deploy.js --network localhost
```

---

## 📋 Configuración

### Hardhat Config (hardhat.config.js)
```javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    hardhat: {
      chainId: 31337
    }
  }
};
```

### Variables de Entorno
```bash
# Para desarrollo local
RPC_URL=http://localhost:8545
PRIVATE_KEY=0x... # (de las cuentas de Hardhat)

# Para testnets
# SEPOLIA_RPC_URL=https://...
# SEPOLIA_PRIVATE_KEY=0x...
```

---

## 🔗 Integración con APIs

Las 3 APIs backend pueden interactuar con el nodo Hardhat:

### Admin API
- Deploy de contratos NFT al crear eventos
- Mintear tokens al vender tickets

### Marketplace API
- Verificar ownership de NFTs
- Transferir tokens en reventas

### Access API
- Validar tokens al hacer check-in
- Verificar ownership on-chain

**Ejemplo de integración** (ethers.js):
```javascript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const contract = new ethers.Contract(address, ABI, provider);

// Verificar owner de un ticket NFT
const owner = await contract.ownerOf(tokenId);
console.log('Owner:', owner);
```

---

## 🧪 Testing

### Ejecutar todos los tests
```bash
cd futura-tickets-contracts-v2
npx hardhat test
```

### Ejecutar test específico
```bash
npx hardhat test test/EventNFT.test.js
```

### Ver coverage
```bash
npx hardhat coverage
```

---

## 📊 Cuentas de Desarrollo

Cuando inicias Hardhat node, obtienes 20 cuentas con 10,000 ETH cada una:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

... (18 más)
```

**⚠️ NUNCA uses estas claves en mainnet o testnets públicas!**

---

## 🔥 Problemas Comunes

### Error: "Port 8545 already in use"
```bash
# Ver qué proceso usa el puerto
lsof -i :8545

# Matarlo
kill -9 <PID>

# O
pkill -f "hardhat node"
```

### Error: "Cannot connect to Hardhat node"
```bash
# Verificar que está corriendo
curl http://localhost:8545

# Si no responde, iniciar
./start-blockchain.sh
```

### Error: "Nonce too high"
```bash
# Reiniciar Hardhat node (limpia el estado)
pkill -f "hardhat node"
./start-blockchain.sh
```

### Error: "Contract not deployed"
```bash
# Deploy de contratos
cd futura-tickets-contracts-v2
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🚀 Quick Start Completo

```bash
# 1. Instalar dependencias (primera vez)
cd futura-tickets-contracts-v2
npm install

# 2. Compilar contratos
npx hardhat compile

# 3. Ejecutar tests (opcional)
npx hardhat test

# 4. Iniciar nodo local
./start-blockchain.sh

# 5. En otra terminal, deploy de contratos
cd futura-tickets-contracts-v2
npx hardhat run scripts/deploy.js --network localhost

# 6. Verificar
curl http://localhost:8545 -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

---

## 📝 Smart Contracts

### EventNFT Contract
**Propósito**: Representa tickets como NFTs

**Funciones principales**:
- `mint(to, tokenId)` - Mintear nuevo ticket NFT
- `ownerOf(tokenId)` - Verificar dueño del ticket
- `transferFrom(from, to, tokenId)` - Transferir ticket
- `burn(tokenId)` - Quemar ticket al hacer check-in

### TicketMarketplace Contract (si existe)
**Propósito**: Gestionar mercado secundario

**Funciones principales**:
- `listForSale(tokenId, price)` - Poner en venta
- `cancelListing(tokenId)` - Cancelar venta
- `buyTicket(tokenId)` - Comprar ticket en reventa

---

## 🔗 Recursos

### Documentación
- [Hardhat Docs](https://hardhat.org/docs)
- [ethers.js Docs](https://docs.ethers.io/v6/)
- [Solidity Docs](https://docs.soliditylang.org/)

### Explorador Local
Para ver transacciones y contratos localmente:
- **Hardhat Console**: `npx hardhat console --network localhost`
- **Tenderly Fork** (avanzado)

---

## 🌐 Deployment a Testnets

### Configuración para Sepolia
```javascript
// hardhat.config.js
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.SEPOLIA_PRIVATE_KEY],
    chainId: 11155111
  }
}
```

### Deploy
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Verificar en Etherscan
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

---

**Para más información**: Ver `README_MASTER.md` y `PORT_MAP.md`
