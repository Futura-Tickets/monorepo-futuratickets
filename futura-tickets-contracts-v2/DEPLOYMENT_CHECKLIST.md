# 🚀 DEPLOYMENT CHECKLIST - FUTURATICKETS BLOCKCHAIN

> **Estado actual**: Listo para obtener API keys y deployment
> **Tiempo estimado**: 2-3 horas
> **Última actualización**: 2025-10-15

---

## 📋 CHECKLIST COMPLETO

### ✅ FASE 1: PREPARACIÓN (COMPLETADO 100%)

- [x] Smart contracts escritos (FuturaEvent.sol, FuturaEventFactory.sol)
- [x] Tests implementados (15+ test cases)
- [x] Hardhat configurado (hardhat.config.ts)
- [x] Deployment scripts creados (deploy/01_deploy_factory.ts)
- [x] Helper scripts creados (scripts/create-event.ts)
- [x] Package.json con scripts npm
- [x] .env.example template
- [x] .gitignore configurado
- [x] WalletService implementado (backend)
- [x] BlockchainService implementado (backend)
- [x] AbstractionService implementado (backend)
- [x] Schemas actualizados (Account, Order, Sale)
- [x] Módulos integrados (WalletModule, BlockchainModule)
- [x] mintTicket() reemplazado con nueva versión
- [x] ABIs ya copiados a backend
- [x] Documentación completa (2,200+ líneas)

**Status**: ✅ **100% COMPLETO**

---

### ⏳ FASE 2: OBTENER API KEYS (15 minutos)

#### 2.1 Alchemy API Key
- [ ] Ir a: https://dashboard.alchemy.com/
- [ ] Sign up / Login
- [ ] Click "Create new app"
- [ ] Configurar:
  - Name: `FuturaTickets Base Sepolia`
  - Chain: `Base`
  - Network: `Base Sepolia`
- [ ] Click "View key" → Copiar "API KEY"
- [ ] Pegar en `.env`: `ALCHEMY_API_KEY=tu_key_aqui`

#### 2.2 Pimlico API Key (Account Abstraction)
- [ ] Ir a: https://dashboard.pimlico.io/
- [ ] Sign up / Login
- [ ] Click "Create Project"
- [ ] Name: `FuturaTickets`
- [ ] Copiar "API Key" (empieza con `pim_`)
- [ ] Pegar en backend `.env`: `PIMLICO_API_KEY=tu_key_aqui`

#### 2.3 Basescan API Key (Verification)
- [ ] Ir a: https://basescan.org/register
- [ ] Sign up / Login
- [ ] My Profile → API Keys
- [ ] Click "Add" → Generate new API key
- [ ] Copiar API key
- [ ] Pegar en contracts `.env`: `BASESCAN_API_KEY=tu_key_aqui`

#### 2.4 Obtener ETH Testnet
- [ ] Crear/usar wallet MetaMask
- [ ] Ir a: https://faucet.quicknode.com/base/sepolia
- [ ] Conectar wallet
- [ ] Request ~0.5 ETH para gas
- [ ] Copiar wallet address → `.env`: `DEPLOYER=0x...`
- [ ] Exportar private key (MetaMask → Account Details → Export Private Key)
- [ ] Pegar en contracts `.env`: `DEPLOYER_PRIVATE_KEY=0x...`

**Tiempo estimado**: 15 minutos

---

### ⏳ FASE 3: CONFIGURAR .ENV FILES (10 minutos)

#### 3.1 Contracts .env
```bash
cd futura-tickets-contracts-v2

# Editar .env con tus valores:
ALCHEMY_API_KEY=abc123xyz...
DEPLOYER_PRIVATE_KEY=0x1234567890abcdef...
BASESCAN_API_KEY=XYZ123ABC...
DEPLOYER=0xYourWalletAddress...
```

#### 3.2 Backend .env
```bash
cd futura-tickets-admin-api

# Agregar a tu .env existente:
BLOCKCHAIN_ENABLED=true
FACTORY_CONTRACT_ADDRESS=  # Vacío por ahora, se llena después del deployment
ALCHEMY_API_KEY=abc123xyz...  # El mismo de contracts
PIMLICO_API_KEY=pim_abc123xyz...
RPC_URL=https://sepolia.base.org

# Generar encryption key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copiar output y pegar:
WALLET_ENCRYPTION_KEY=0123456789abcdef...
```

**Checklist:**
- [ ] Contracts `.env` configurado con 4 variables
- [ ] Backend `.env` actualizado con 5 nuevas variables
- [ ] `WALLET_ENCRYPTION_KEY` generado (64 caracteres hex)
- [ ] Todas las keys pegadas correctamente

**Tiempo estimado**: 10 minutos

---

### ⏳ FASE 4: COMPILAR Y TESTEAR CONTRATOS (15 minutos)

```bash
cd futura-tickets-contracts-v2

# Instalar dependencies
npm install

# Compilar contratos
npm run compile

# Ejecutar tests
npm test

# (Opcional) Ver gas usage
npm run test:gas
```

**Checklist:**
- [ ] `npm install` completado sin errores
- [ ] `npm run compile` exitoso
- [ ] `npm test` - todos los tests pasan (15+)
- [ ] Artifacts generados en `artifacts/`

**Output esperado:**
```
✓ Should deploy FuturaEventFactory (234ms)
✓ Should create new event contract (567ms)
✓ Should mint NFT correctly (432ms)
✓ Should set NFT price (123ms)
... (15+ tests passing)
```

**Tiempo estimado**: 15 minutos

---

### ⏳ FASE 5: DEPLOY FACTORY CONTRACT (30 minutos)

```bash
cd futura-tickets-contracts-v2

# Deploy a Base Sepolia testnet
npm run deploy:baseSepolia -- --tags factory

# O con comando completo:
npx hardhat deploy --network baseSepolia --tags factory
```

**Output esperado:**
```
============================================================
Deploying FuturaEventFactory...
Deployer: 0xYourAddress
============================================================

============================================================
✅ FuturaEventFactory deployed!
Address: 0x1234567890abcdef1234567890abcdef12345678
Transaction: 0xabc123def456...
============================================================

Waiting for block confirmations before verification...
✅ Contract verified on block explorer

📝 Save this address to your backend .env:
FACTORY_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

**Checklist:**
- [ ] Deployment completado sin errores
- [ ] Factory address obtenido: `0x...`
- [ ] Contract verificado en Basescan
- [ ] Verificación en Basescan: https://sepolia.basescan.org/address/0x...

**⚠️ IMPORTANTE**: Guardar el Factory address, lo necesitas para el siguiente paso.

**Tiempo estimado**: 30 minutos (incluyendo confirmaciones)

---

### ⏳ FASE 6: ACTUALIZAR BACKEND .ENV (2 minutos)

```bash
cd futura-tickets-admin-api

# Editar .env y agregar el Factory address del paso anterior:
FACTORY_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
```

**Checklist:**
- [ ] `FACTORY_CONTRACT_ADDRESS` actualizado en backend `.env`
- [ ] Address copiado correctamente (42 caracteres con `0x`)

**Tiempo estimado**: 2 minutos

---

### ⏳ FASE 7: VERIFICAR ABIs (5 minutos)

Los ABIs ya deberían estar copiados. Verificar:

```bash
# Verificar que existen los ABIs
ls -lh futura-tickets-admin-api/src/abis/

# Deberías ver:
# FuturaEvent.json
# FuturaEventFactory.json
```

**Si no existen**, copiarlos:

```bash
cd futura-tickets-contracts-v2

cp artifacts/contracts/FuturaEvent.sol/FuturaEvent.json \
   ../futura-tickets-admin-api/src/abis/FuturaEvent.json

cp artifacts/contracts/FuturaEventFactory.sol/FuturaEventFactory.json \
   ../futura-tickets-admin-api/src/abis/FuturaEventFactory.json
```

**Checklist:**
- [ ] `FuturaEvent.json` existe en `src/abis/`
- [ ] `FuturaEventFactory.json` existe en `src/abis/`
- [ ] Ambos archivos tienen contenido (no vacíos)

**Tiempo estimado**: 5 minutos

---

### ⏳ FASE 8: START BACKEND Y VERIFICAR (10 minutos)

```bash
cd futura-tickets-admin-api

# Instalar dependencies si es necesario
npm install

# Start en modo desarrollo
npm run start:dev
```

**Logs esperados:**
```
✅ WalletService initialized with encryption
🔗 Starting blockchain event listeners...
📡 Setting up listeners for 0 existing event contracts
✅ Blockchain event listeners active
[Nest] 12345  - Application is running on: http://localhost:3000
```

**Checklist:**
- [ ] Backend inicia sin errores
- [ ] Log muestra "WalletService initialized with encryption"
- [ ] Log muestra "Blockchain event listeners active"
- [ ] No hay errores de "WALLET_ENCRYPTION_KEY not configured"
- [ ] No hay errores de "FACTORY_CONTRACT_ADDRESS not configured"
- [ ] No hay errores de "Cannot find module '../abis/FuturaEvent.json'"

**⚠️ ERRORES COMUNES:**

| Error | Solución |
|-------|----------|
| "WALLET_ENCRYPTION_KEY not configured" | Revisar Fase 3.2 |
| "FACTORY_CONTRACT_ADDRESS not configured" | Revisar Fase 6 |
| "Cannot find module '../abis/FuturaEvent.json'" | Revisar Fase 7 |

**Tiempo estimado**: 10 minutos

---

### ⏳ FASE 9: TESTING END-TO-END (1 hora)

#### 9.1 Crear Evento de Prueba (5 min)

Via Postman/Insomnia o admin dashboard:

```bash
POST http://localhost:3000/admin/events/create
Authorization: Bearer {tu_jwt_token}

Body:
{
  "name": "Test Concert Base Sepolia",
  "description": "Evento de prueba para blockchain",
  "isBlockchain": false,  // Empezar con false
  "maxQuantity": 10,
  "capacity": 100,
  // ... otros campos necesarios
}

# Guardar el event._id del response
```

**Checklist:**
- [ ] Evento creado exitosamente
- [ ] `event._id` guardado
- [ ] `isBlockchain: false` por ahora

#### 9.2 Deploy Contrato para el Evento (10 min)

```bash
cd futura-tickets-contracts-v2

# Editar scripts/create-event.ts líneas 18-21:
# const eventName = "Test Concert Base Sepolia";
# const maxSupply = 100;
# const baseURI = "https://api.futuratickets.com/metadata/";

# Ejecutar
npx hardhat run scripts/create-event.ts --network baseSepolia
```

**Output esperado:**
```
============================================================
Creating New Event Contract
============================================================

Event Parameters:
  Name: Test Concert Base Sepolia
  Owner: 0xYourAddress
  Max Supply: 100
  Base URI: https://api.futuratickets.com/metadata/

Factory Address: 0xYourFactoryAddress
Deployer: 0xYourAddress
============================================================

📡 Sending transaction...
Transaction hash: 0xabc123...
⏳ Waiting for confirmation...
✅ Transaction confirmed!
Block number: 12345

============================================================
✅ Event Contract Created!
  Event ID: 1
  Contract Address: 0xabcdef1234567890abcdef1234567890abcdef12
============================================================

📝 Save this to your database:
  Event { address: "0xabcdef...", blockNumber: 12345 }
```

**Checklist:**
- [ ] Contract address obtenido: `0x...`
- [ ] Transaction confirmada
- [ ] Address guardado

**⚠️ IMPORTANTE**: Copiar ese CONTRACT ADDRESS para el siguiente paso.

#### 9.3 Actualizar Evento en MongoDB (5 min)

Via MongoDB Compass, CLI, o API:

```javascript
// MongoDB Shell o Compass
db.events.updateOne(
  { _id: ObjectId("tu_event_id_del_paso_9.1") },
  {
    $set: {
      isBlockchain: true,
      address: "0xabcdef1234567890abcdef1234567890abcdef12"  // Del paso 9.2
    }
  }
)
```

O via API:
```bash
PATCH http://localhost:3000/admin/events/{event_id}
{
  "isBlockchain": true,
  "address": "0xabcdef1234567890abcdef1234567890abcdef12"
}
```

**Checklist:**
- [ ] Evento actualizado: `isBlockchain: true`
- [ ] Evento actualizado: `address: "0x..."`
- [ ] Verificado en MongoDB

#### 9.4 Comprar Ticket de Prueba (10 min)

Via marketplace o Postman:

```bash
POST http://localhost:3000/orders/create

Body:
{
  "event": "tu_event_id",
  "items": [
    {
      "type": "General",
      "amount": 1,
      "price": 10
    }
  ],
  "contactDetails": {
    "name": "Test",
    "lastName": "User",
    "email": "test@test.com",
    "birthdate": "1990-01-01",
    "phone": "+1234567890"
  }
}

# Response tendrá clientSecret para Stripe
```

**Pagar con Stripe test card:**
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

**Checklist:**
- [ ] Order creada
- [ ] Pago procesado con Stripe
- [ ] Email recibido (check inbox de test@test.com)

#### 9.5 Verificar en Logs del Backend (5 min)

Deberías ver en los logs:

```
🎫 Creating ticket transaction started!
🔗 Minting NFT for event "Test Concert Base Sepolia" at 0xabcdef...
🆕 Creating new wallet for user 6789abcd...
✅ Created wallet for user 6789abcd: 0x1234...
👛 User wallet: 0x1234...
Smart Account Address: 0x5678...
🔐 Smart Account: 0x5678...
📤 Sending transaction via Account Abstraction...
✅ NFT minted! TX Hash: 0xfedcba9876543210...
✅ Sale 987654321 updated with blockchain info
⏳ Waiting for blockchain confirmation (via BlockchainService)...

# Unos segundos después:
🎫 TokenMinted: Contract=0xabcdef..., TokenId=1, Client=0x5678...
✅ Updated order abc123 with tokenId 1
```

**Checklist:**
- [ ] Log muestra "NFT minted! TX Hash: 0x..."
- [ ] Log muestra "Creating new wallet" o "User wallet: 0x..."
- [ ] Log muestra "Smart Account: 0x..."
- [ ] No hay errores

#### 9.6 Verificar en Basescan (10 min)

```bash
# Ir a:
https://sepolia.basescan.org/address/0xabcdef1234567890abcdef1234567890abcdef12

# Buscar tu transaction hash del log
```

**Deberías ver:**
- [ ] Transactions tab: 1 transaction (mintNFT)
- [ ] Events tab: TokenMinted event
- [ ] Token ID #1 visible

**Ejemplo de lo que verás:**
```
Transaction Hash: 0xfedcba9876543210...
Status: Success ✅
From: 0x... (Smart Account)
To: 0x... (Event Contract)
Method: mintNFT
```

#### 9.7 Verificar en MongoDB (10 min)

```javascript
// Verificar Sale
db.sales.findOne({ order: ObjectId("order_id_del_paso_9.4") })

// Debería tener:
{
  _id: ObjectId("..."),
  blockchain: {
    transactionHash: "0xfedcba9876543210...",
    contractAddress: "0xabcdef...",
    tokenId: 1,  // ✅ Este campo lo actualiza BlockchainService
    confirmed: true
  },
  status: "OPEN",
  qrCode: "data:image/png;base64,..."
}

// Verificar Account
db.accounts.findOne({ email: "test@test.com" })

// Debería tener:
{
  _id: ObjectId("..."),
  walletAddress: "0x1234...",  // EOA wallet
  smartAddress: "0x5678...",   // Smart Account
  key: "encrypted_key_here",   // Encrypted private key
  mnemonic: "encrypted_mnemonic_here",
  isBlockchainEnabled: true
}
```

**Checklist:**
- [ ] Sale tiene `blockchain.transactionHash`
- [ ] Sale tiene `blockchain.tokenId: 1`
- [ ] Sale tiene `blockchain.confirmed: true`
- [ ] Account tiene `walletAddress`
- [ ] Account tiene `smartAddress`
- [ ] Account tiene `key` (encriptado)
- [ ] Account tiene `isBlockchainEnabled: true`

#### 9.8 Verificar Email (5 min)

Check inbox de test@test.com:

**Email debería contener:**
- [ ] QR code del ticket
- [ ] Información del evento
- [ ] Nombre del comprador
- [ ] Tipo de ticket y precio

**Tiempo total testing**: ~1 hora

---

## ✅ RESUMEN FINAL

### Fases Completadas

- ✅ **Fase 1**: Preparación (100% completo)
- ⏳ **Fase 2**: Obtener API keys (15 min)
- ⏳ **Fase 3**: Configurar .env (10 min)
- ⏳ **Fase 4**: Compilar y testear (15 min)
- ⏳ **Fase 5**: Deploy Factory (30 min)
- ⏳ **Fase 6**: Actualizar backend .env (2 min)
- ⏳ **Fase 7**: Verificar ABIs (5 min)
- ⏳ **Fase 8**: Start backend (10 min)
- ⏳ **Fase 9**: Testing E2E (1 hora)

**Tiempo total estimado**: 2-3 horas

---

## 🎯 SIGUIENTE PASO INMEDIATO

**Empezar con Fase 2**: Obtener API keys (15 minutos)

1. Alchemy: https://dashboard.alchemy.com/
2. Pimlico: https://dashboard.pimlico.io/
3. Basescan: https://basescan.org/apis
4. Base Sepolia Faucet: https://faucet.quicknode.com/base/sepolia

Una vez tengas las 4 API keys, continuar con Fase 3.

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisar logs cuidadosamente
2. Consultar `PASOS_FINALES_DEPLOYMENT.md` para más detalles
3. Consultar `BLOCKCHAIN_INTEGRATION_GUIDE.md` para arquitectura
4. Verificar que todos los .env están correctos

---

**Creado**: 2025-10-15
**Última actualización**: 2025-10-15
**Estado**: ✅ Listo para Fase 2
