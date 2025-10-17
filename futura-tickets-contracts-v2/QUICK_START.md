# ⚡ QUICK START - DEPLOYMENT EN 10 PASOS

> **Para usuarios que quieren deployment rápido sin leer toda la documentación**
> **Tiempo total**: 2-3 horas

---

## PREREQUISITOS

- Node.js instalado
- MetaMask o wallet Ethereum
- Acceso a internet

---

## 📝 LOS 10 PASOS

### 1️⃣ OBTENER ALCHEMY API KEY (3 min)

```
https://dashboard.alchemy.com/
→ Sign up
→ Create app: "FuturaTickets Base Sepolia"
→ Chain: Base, Network: Base Sepolia
→ Copy API KEY
```

---

### 2️⃣ OBTENER PIMLICO API KEY (3 min)

```
https://dashboard.pimlico.io/
→ Sign up
→ Create Project: "FuturaTickets"
→ Copy API Key (empieza con pim_)
```

---

### 3️⃣ OBTENER BASESCAN API KEY (3 min)

```
https://basescan.org/register
→ Sign up
→ My Profile → API Keys → Add
→ Copy API key
```

---

### 4️⃣ OBTENER ETH TESTNET (5 min)

```
https://faucet.quicknode.com/base/sepolia
→ Conectar MetaMask
→ Request 0.5 ETH
→ Copiar tu wallet address
→ Exportar private key (MetaMask → Account Details → Export Private Key)
```

---

### 5️⃣ CONFIGURAR .ENV CONTRACTS (2 min)

```bash
cd futura-tickets-contracts-v2
nano .env  # o usa tu editor preferido

# Pegar:
ALCHEMY_API_KEY=tu_alchemy_key
DEPLOYER_PRIVATE_KEY=0xtu_private_key
BASESCAN_API_KEY=tu_basescan_key
DEPLOYER=0xtu_wallet_address
```

---

### 6️⃣ CONFIGURAR .ENV BACKEND (3 min)

```bash
cd ../futura-tickets-admin-api

# Generar encryption key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Agregar a tu .env existente:
BLOCKCHAIN_ENABLED=true
FACTORY_CONTRACT_ADDRESS=
ALCHEMY_API_KEY=tu_alchemy_key
PIMLICO_API_KEY=tu_pimlico_key
WALLET_ENCRYPTION_KEY=el_hash_generado_arriba
RPC_URL=https://sepolia.base.org
```

---

### 7️⃣ COMPILAR Y DEPLOY FACTORY (20 min)

```bash
cd ../futura-tickets-contracts-v2

npm install
npm run compile
npm run deploy:baseSepolia -- --tags factory

# IMPORTANTE: Copiar el Factory Address del output
# Ejemplo: 0x1234567890abcdef...
```

---

### 8️⃣ ACTUALIZAR FACTORY ADDRESS (1 min)

```bash
cd ../futura-tickets-admin-api

# Editar .env:
FACTORY_CONTRACT_ADDRESS=0x...  # El address del paso 7
```

---

### 9️⃣ START BACKEND (5 min)

```bash
cd futura-tickets-admin-api

npm install
npm run start:dev

# Verificar logs:
# ✅ WalletService initialized with encryption
# ✅ Blockchain event listeners active
```

---

### 🔟 PROBAR (30 min)

#### A. Crear evento de prueba

```bash
POST /admin/events/create
{ "name": "Test Event", "isBlockchain": false, ... }
```

#### B. Deploy contrato del evento

```bash
cd futura-tickets-contracts-v2
# Editar scripts/create-event.ts con nombre del evento
npx hardhat run scripts/create-event.ts --network baseSepolia
# Copiar contract address
```

#### C. Actualizar evento en MongoDB

```javascript
db.events.updateOne(
  { _id: ObjectId("event_id") },
  { $set: { isBlockchain: true, address: "0x..." } }
)
```

#### D. Comprar ticket de prueba

```bash
POST /orders/create
{
  "event": "event_id",
  "items": [{ "type": "General", "amount": 1, "price": 10 }],
  "contactDetails": { ... }
}

# Pagar con Stripe test card: 4242 4242 4242 4242
```

#### E. Verificar

- [ ] Check logs: "NFT minted! TX Hash: 0x..."
- [ ] Check Basescan: https://sepolia.basescan.org/address/0x...
- [ ] Check MongoDB: sale.blockchain.tokenId debería ser 1

---

## ✅ DONE!

Si todos los pasos pasaron, tienes:

✅ Factory contract deployed
✅ Backend conectado a blockchain
✅ Primer ticket NFT creado
✅ Sistema funcionando end-to-end

---

## 🐛 PROBLEMAS?

### Error: "insufficient funds for gas"
→ Obtener más ETH del faucet (paso 4)

### Error: "WALLET_ENCRYPTION_KEY not configured"
→ Revisar paso 6

### Error: "Cannot find module '../abis/FuturaEvent.json'"
→ Ejecutar:
```bash
cd futura-tickets-contracts-v2
cp artifacts/contracts/FuturaEvent.sol/FuturaEvent.json \
   ../futura-tickets-admin-api/src/abis/FuturaEvent.json
cp artifacts/contracts/FuturaEventFactory.sol/FuturaEventFactory.json \
   ../futura-tickets-admin-api/src/abis/FuturaEventFactory.json
```

### Backend no inicia
→ `npm install` en futura-tickets-admin-api

---

## 📚 MÁS INFO

Para guía detallada: `PASOS_FINALES_DEPLOYMENT.md`
Para arquitectura: `BLOCKCHAIN_INTEGRATION_GUIDE.md`
Para troubleshooting: `DEPLOYMENT_CHECKLIST.md`

---

**¡Listo para convertir tickets en NFTs!** 🎫→🔗
