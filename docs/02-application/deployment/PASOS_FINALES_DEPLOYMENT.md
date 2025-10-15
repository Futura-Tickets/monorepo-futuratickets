# 🚀 PASOS FINALES PARA DEPLOYMENT - BLOCKCHAIN FUTURATICKETS

> **Tiempo total**: 2-3 horas
> **Dificultad**: Fácil (solo configuración)

---

## 📋 PREREQUISITOS

- Node.js instalado
- Acceso a futura-tickets-contracts-v2 y futura-tickets-admin-api
- Acceso a MongoDB

---

## PASO 1: OBTENER API KEYS (15 minutos)

### 1.1 Alchemy (RPC Provider)
```
1. Ir a: https://dashboard.alchemy.com/
2. Sign up (gratis)
3. Click "Create new app"
4. Name: "FuturaTickets Base Sepolia"
5. Chain: "Base"
6. Network: "Base Sepolia"
7. Click "Create app"
8. Click "View key" → Copiar "API KEY"
```

### 1.2 Pimlico (Account Abstraction)
```
1. Ir a: https://dashboard.pimlico.io/
2. Sign up (gratis)
3. Click "Create Project"
4. Name: "FuturaTickets"
5. Click proyecto → Copiar "API Key" (empieza con "pim_")
```

### 1.3 Basescan (Verification)
```
1. Ir a: https://basescan.org/register
2. Sign up (gratis)
3. My Profile → API Keys
4. Click "Add" → Generate new API key
5. Copiar API key
```

### 1.4 Obtener ETH Testnet
```
1. Crear/usar wallet MetaMask
2. Ir a: https://faucet.quicknode.com/base/sepolia
3. Conectar wallet
4. Request ~0.5 ETH para gas
5. Copiar:
   - Tu wallet address
   - Tu private key (MetaMask → Account Details → Export Private Key)
```

---

## PASO 2: CONFIGURAR .ENV - CONTRACTS (10 minutos)

```bash
cd futura-tickets-contracts-v2

# Crear .env
cat > .env << 'EOF'
ALCHEMY_API_KEY=tu_alchemy_key_aqui
DEPLOYER_PRIVATE_KEY=0xtu_private_key_aqui
BASESCAN_API_KEY=tu_basescan_key_aqui
DEPLOYER=tu_wallet_address_aqui
EOF

# Ejemplo:
# ALCHEMY_API_KEY=abc123xyz
# DEPLOYER_PRIVATE_KEY=0x1234567890abcdef...
# BASESCAN_API_KEY=XYZ123ABC
# DEPLOYER=0xYourWalletAddress
```

---

## PASO 3: DEPLOY FACTORY CONTRACT (30 minutos)

```bash
cd futura-tickets-contracts-v2

# Instalar dependencies
npm install

# Compilar contratos
npx hardhat compile

# Deploy a Base Sepolia
npx hardhat deploy --network baseSepolia --tags factory

# 🎯 OUTPUT ESPERADO:
# ============================================================
# Deploying FuturaEventFactory...
# Deployer: 0xYourAddress
# ============================================================
#
# ============================================================
# ✅ FuturaEventFactory deployed!
# Address: 0x1234567890abcdef1234567890abcdef12345678
# Transaction: 0xabc...
# ============================================================
#
# Waiting for block confirmations before verification...
# ✅ Contract verified on block explorer
#
# 📝 Save this address to your backend .env:
# FACTORY_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# ⚠️ IMPORTANTE: GUARDAR ESE ADDRESS!
```

**Si hay error**: Verificar que tienes ETH testnet en tu wallet.

---

## PASO 4: COPIAR ABIs AL BACKEND (5 minutos)

```bash
# Desde futura-tickets-contracts-v2/

# Copiar FuturaEvent ABI
cp artifacts/contracts/FuturaEvent.sol/FuturaEvent.json \
   ../futura-tickets-admin-api/src/abis/FuturaEvent.json

# Copiar FuturaEventFactory ABI
cp artifacts/contracts/FuturaEventFactory.sol/FuturaEventFactory.json \
   ../futura-tickets-admin-api/src/abis/FuturaEventFactory.json

# Verificar que se copiaron
ls -lh ../futura-tickets-admin-api/src/abis/
```

---

## PASO 5: CONFIGURAR .ENV - BACKEND (10 minutos)

```bash
cd ../futura-tickets-admin-api

# Generar encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copiar el output (64 caracteres)

# Agregar a tu .env existente:
cat >> .env << 'EOF'

# ========================================
# BLOCKCHAIN CONFIGURATION
# ========================================
BLOCKCHAIN_ENABLED=true
FACTORY_CONTRACT_ADDRESS=0x_el_address_del_paso_3_aqui
ALCHEMY_API_KEY=tu_alchemy_key_aqui
PIMLICO_API_KEY=tu_pimlico_key_aqui
WALLET_ENCRYPTION_KEY=el_hash_generado_arriba
RPC_URL=https://sepolia.base.org
EOF
```

**Ejemplo completo**:
```bash
BLOCKCHAIN_ENABLED=true
FACTORY_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
ALCHEMY_API_KEY=abc123xyz
PIMLICO_API_KEY=pim_abc123xyz
WALLET_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
RPC_URL=https://sepolia.base.org
```

---

## PASO 6: REEMPLAZAR mintTicket() (15 minutos)

### Opción A: Manual

1. Abrir `futura-tickets-admin-api/src/Event/admin-event.service.ts`
2. Buscar el método `public async mintTicket(mintTicket: MintTicket)`
3. Reemplazar TODO el método (líneas 453-534) con el código del archivo:
   `futura-tickets-contracts-v2/MINTTICKET_NEW_VERSION.ts` (líneas 17-129)

### Opción B: Con sed (Linux/Mac)

```bash
# ⚠️ HACER BACKUP PRIMERO
cp src/Event/admin-event.service.ts src/Event/admin-event.service.ts.backup

# Luego manualmente copiar/pegar la nueva versión
# (sed es complicado para esto, mejor hacerlo manual)
```

**Verificar**: El método debe empezar con:
```typescript
public async mintTicket(mintTicket: MintTicket): Promise<void> {
  console.log('🎫 Creating ticket transaction started!');

  try {
    // Get event
    const event = await this.eventModel.findById(mintTicket.event._id);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if blockchain is enabled for this event
    if (event.isBlockchain && event.address) {
      console.log(`🔗 Minting NFT for event "${event.name}" at ${event.address}`);
```

---

## PASO 7: VERIFICAR INSTALACIÓN (10 minutos)

```bash
cd futura-tickets-admin-api

# Verificar que todos los archivos existen
ls -la src/Wallet/wallet.service.ts
ls -la src/Wallet/wallet.module.ts
ls -la src/Blockchain/blockchain.service.ts
ls -la src/Blockchain/blockchain.module.ts
ls -la src/abis/FuturaEvent.json
ls -la src/abis/FuturaEventFactory.json

# Si alguno falta, revisar PASO 4
```

---

## PASO 8: START BACKEND (10 minutos)

```bash
cd futura-tickets-admin-api

# Instalar dependencias si es necesario
npm install

# Start en modo desarrollo
npm run start:dev

# 🎯 LOGS ESPERADOS:
# ✅ WalletService initialized with encryption
# 🔗 Starting blockchain event listeners...
# 📡 Setting up listeners for 0 existing event contracts
# ✅ Blockchain event listeners active
# [Nest] 12345  - Application is running on: http://localhost:3000

# ⚠️ SI HAY ERRORES:
# - "WALLET_ENCRYPTION_KEY not configured" → Revisar PASO 5
# - "FACTORY_CONTRACT_ADDRESS not configured" → Revisar PASO 5
# - "Cannot find module '../abis/FuturaEvent.json'" → Revisar PASO 4
```

---

## PASO 9: TESTING E2E (1 hora)

### 9.1 Crear Evento de Prueba

Via Postman/Insomnia o tu admin dashboard:

```bash
POST http://localhost:3000/admin/events/create
Authorization: Bearer {tu_jwt_token}

Body:
{
  "name": "Test Concert Base Sepolia",
  "description": "Evento de prueba para blockchain",
  "isBlockchain": false,  # ⚠️ Empezar con false
  "maxQuantity": 10,
  "capacity": 100,
  // ... otros campos necesarios
}

# Guardar el event._id del response
```

### 9.2 Deploy Contrato para Ese Evento

```bash
cd futura-tickets-contracts-v2

# Editar scripts/create-event.ts líneas 18-21:
# const eventName = "Test Concert Base Sepolia";
# const maxSupply = 100;
# const baseURI = "https://api.futuratickets.com/metadata/";

# Ejecutar
npx hardhat run scripts/create-event.ts --network baseSepolia

# 🎯 OUTPUT ESPERADO:
# ============================================================
# Creating New Event Contract
# ============================================================
#
# Event Parameters:
#   Name: Test Concert Base Sepolia
#   Owner: 0xYourAddress
#   Max Supply: 100
#   Base URI: https://api.futuratickets.com/metadata/
#
# Factory Address: 0xYourFactoryAddress
# Deployer: 0xYourAddress
# ============================================================
#
# 📡 Sending transaction...
# Transaction hash: 0xabc...
# ⏳ Waiting for confirmation...
# ✅ Transaction confirmed!
# Block number: 12345
#
# ============================================================
# ✅ Event Contract Created!
#   Event ID: 1
#   Contract Address: 0xabcdef1234567890abcdef1234567890abcdef12
# ============================================================
#
# 📝 Save this to your database:
#   Event { address: "0xabcdef...", blockNumber: 12345 }

# ⚠️ COPIAR ESE CONTRACT ADDRESS!
```

### 9.3 Actualizar Evento en MongoDB

Via MongoDB Compass, CLI, o tu admin dashboard:

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

O via API si tienes un endpoint:
```bash
PATCH http://localhost:3000/admin/events/{event_id}
{
  "isBlockchain": true,
  "address": "0xabcdef1234567890abcdef1234567890abcdef12"
}
```

### 9.4 Comprar Ticket de Prueba

Via tu marketplace o Postman:

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

Pagar con Stripe test card:
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### 9.5 Verificar en Logs del Backend

```bash
# Deberías ver en los logs:
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

### 9.6 Verificar en Basescan

```bash
# Ir a:
https://sepolia.basescan.org/address/0xabcdef1234567890abcdef1234567890abcdef12

# Deberías ver:
# - Transactions tab: 1 transaction (mintNFT)
# - Events tab: TokenMinted event
# - Tokens tab: Token ID #1
```

### 9.7 Verificar en MongoDB

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

### 9.8 Verificar Email

El usuario debería recibir un email con:
- QR code del ticket
- Información del evento
- (El token ID aún no se muestra en el email, pero está en la BD)

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Factory contract deployed a Base Sepolia
- [ ] Factory address en Basescan verificado
- [ ] ABIs copiados al backend
- [ ] .env del backend configurado con todas las keys
- [ ] mintTicket() reemplazado con nueva versión
- [ ] Backend inicia sin errores
- [ ] WalletService logs "initialized with encryption"
- [ ] BlockchainService logs "event listeners active"
- [ ] Event contract deployed para evento de prueba
- [ ] Evento actualizado en BD con address
- [ ] Ticket comprado exitosamente
- [ ] Logs muestran "NFT minted! TX Hash: 0x..."
- [ ] Transaction visible en Basescan
- [ ] TokenMinted event visible en Basescan
- [ ] Sale.blockchain.tokenId actualizado en MongoDB
- [ ] Account.walletAddress y smartAddress creados
- [ ] Email recibido con QR code

---

## 🐛 TROUBLESHOOTING

### Error: "insufficient funds for gas"
**Solución**: Obtener más ETH del faucet (Paso 1.4)

### Error: "WALLET_ENCRYPTION_KEY not configured"
**Solución**: Revisar .env del backend (Paso 5)

### Error: "Cannot find module '../abis/FuturaEvent.json'"
**Solución**: Copiar ABIs nuevamente (Paso 4)

### Error: "FACTORY_CONTRACT_ADDRESS not configured"
**Solución**: Agregar address del Paso 3 al .env (Paso 5)

### Logs no muestran "NFT minted"
**Solución**:
1. Verificar que evento tiene `isBlockchain: true` en BD
2. Verificar que evento tiene `address` en BD
3. Revisar logs por errores de blockchain

### TokenId no se actualiza en MongoDB
**Solución**:
1. Verificar que BlockchainService está activo (logs)
2. Esperar 10-15 segundos (polling cada 5s)
3. Verificar que transaction tiene evento TokenMinted en Basescan

### Backend no inicia
**Solución**:
1. `npm install` en futura-tickets-admin-api
2. Revisar que todas las dependencias están instaladas
3. Verificar syntax errors en admin-event.service.ts

---

## 🎉 ¡LISTO!

Si todos los pasos del checklist están ✅, tienes:

- ✅ NFT tickets funcionando en Base Sepolia testnet
- ✅ Account Abstraction activo (usuarios no pagan gas)
- ✅ Event listeners sincronizando automáticamente
- ✅ Wallets encriptados en BD
- ✅ Sistema completo funcionando end-to-end

**Próximos pasos**:
1. Testing extensivo con múltiples tickets
2. Testing de reventa (si está implementado)
3. Testing de transferencia (si está implementado)
4. Ajustes y optimizaciones
5. Deploy a mainnet cuando esté listo

---

## 📞 SOPORTE

Si tienes problemas:

1. Revisar logs del backend cuidadosamente
2. Revisar transacciones en Basescan
3. Verificar que todos los .env están correctos
4. Consultar `BLOCKCHAIN_INTEGRATION_GUIDE.md` para más detalles
5. Revisar `IMPLEMENTACION_COMPLETADA.md` para contexto

---

**Creado por**: Claude Code
**Fecha**: 2025-10-15
**Versión**: 1.0.0
