# 🔗 TERMINAL 4: BLOCKCHAIN - Hardhat Node

## 📍 Estado Actual

```
✅ Nodo Hardhat corriendo en: http://127.0.0.1:8545
✅ Factory desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ 20 cuentas de desarrollo con 10,000 ETH cada una
```

## 🚀 Comandos Principales

### Iniciar el nodo local
```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-contracts-v2
npx hardhat node
```

### Compilar contratos
```bash
npx hardhat compile
```

### Ejecutar tests
```bash
npx hardhat test
```

### Limpiar cache y artefactos
```bash
npx hardhat clean
```

## 🔑 Cuentas de Desarrollo

### Cuenta Principal (Deployer)
- **Address:** `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- **Private Key:** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Balance:** 10,000 ETH

### Cuenta #1 (Testing)
- **Address:** `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- **Private Key:** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Balance:** 10,000 ETH

> ⚠️ **ADVERTENCIA:** Estas claves son públicas. NO enviar fondos reales a estas direcciones.

## 📦 Contratos Desplegados

### FuturaEventFactory
- **Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Función:** Factory para crear contratos de eventos
- **Gas usado:** 2,639,723

## 🔧 Variables de Entorno (.env)

```bash
# LOCAL DEVELOPMENT (Hardhat Network)
FACTORY_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
LOCAL_RPC_URL=http://127.0.0.1:8545
DEPLOYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
DEPLOYER_PRIVATE_KEY_LOCAL=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## 🧪 Interactuar con el Nodo

### Usando ethers.js (Node.js)

```javascript
const { ethers } = require("ethers");

// Conectar al nodo local
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");

// Cargar wallet
const wallet = new ethers.Wallet(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  provider
);

// Conectar al factory
const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const factoryABI = require("./artifacts/contracts/FuturaEventFactory.sol/FuturaEventFactory.json").abi;
const factory = new ethers.Contract(factoryAddress, factoryABI, wallet);

// Crear un nuevo evento
const tx = await factory.createNew(
  wallet.address,          // owner
  "Mi Evento de Prueba",   // eventName
  1000,                    // maxSupply
  "https://api.example.com/metadata/" // baseURI
);

const receipt = await tx.wait();
console.log("Evento creado:", receipt);
```

### Usando Hardhat Console

```bash
npx hardhat console --network localhost
```

```javascript
// Dentro de la consola
const Factory = await ethers.getContractFactory("FuturaEventFactory");
const factory = Factory.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Crear evento
const tx = await factory.createNew(
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "Test Event",
  1000,
  "https://metadata.example.com/"
);

await tx.wait();
console.log("Evento creado");
```

## 📊 Arquitectura

```
┌─────────────────────────────────────┐
│     Hardhat Node (localhost:8545)   │
├─────────────────────────────────────┤
│                                     │
│  FuturaEventFactory                 │
│  ├─> createNew()                    │
│  ├─> getEventContract()             │
│  └─> getTotalEvents()               │
│                                     │
│  FuturaEvent (deployed per event)   │
│  ├─> mintNFT()                      │
│  ├─> setNFTPrice()                  │
│  ├─> transferNFT()                  │
│  ├─> setTicketStatus()              │
│  └─> cancelResale()                 │
│                                     │
└─────────────────────────────────────┘
```

## 🔄 Reiniciar el Nodo

Si necesitas reiniciar el nodo (se pierden todos los datos):

```bash
# Ctrl+C para detener el nodo actual

# Reiniciar
npx hardhat node
```

> 💡 **Nota:** Al reiniciar, el factory se despliega en la misma dirección (0x5FbDB...) porque Hardhat usa un estado determinístico.

## 🐛 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:8545"
**Solución:** El nodo no está corriendo. Ejecuta `npx hardhat node`.

### Error: "insufficient funds"
**Solución:** Verifica que estás usando una de las 20 cuentas predefinidas con balance.

### Error: "nonce too low"
**Solución:** Reinicia el nodo o usa un nuevo wallet.

### Error: "Contract deployment failed"
**Solución:**
1. Verifica que el nodo esté corriendo
2. Ejecuta `npx hardhat clean && npx hardhat compile`
3. Reinicia el nodo

## 📚 Recursos

- [Hardhat Docs](https://hardhat.org/docs)
- [OpenZeppelin Contracts v5](https://docs.openzeppelin.com/contracts/5.x/)
- [Ethers.js v6](https://docs.ethers.org/v6/)
- [Solidity Docs](https://docs.soliditylang.org/)

## 🔐 Seguridad

- ⚠️ **NUNCA** uses estas claves privadas en mainnet
- ⚠️ **NUNCA** envíes fondos reales a estas direcciones
- ✅ Solo para desarrollo local
- ✅ El nodo se reinicia limpio cada vez

---

**Última actualización:** 2025-10-17
**Nodo corriendo desde:** Shell ID a1db3c
