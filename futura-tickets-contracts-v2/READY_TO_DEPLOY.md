# ✅ READY TO DEPLOY - Instrucciones Finales

**Versión:** 2.0.3
**Fecha:** 17 de Octubre, 2025
**Status:** ✅ **100% READY FOR TESTNET DEPLOYMENT**

---

## 🎯 Estado Actual

### ✅ **Completado y Listo:**
- ✅ Contratos optimizados (0 warnings de Solhint)
- ✅ 49/49 tests passing (100% success rate)
- ✅ Security audit completado (81.33% coverage)
- ✅ Gas optimizado (~50 gas saved per revert)
- ✅ ABIs exportados y sincronizados a 4 backends
- ✅ Documentación completa (DEPLOYMENT_GUIDE.md)
- ✅ Configuración de red (hardhat.config.ts)
- ✅ Scripts de deployment listos

### ⏳ **Pendiente (Acción Requerida por Developers):**
- ⏳ Configurar wallet de deployment (DEPLOYER_PRIVATE_KEY)
- ⏳ Obtener testnet ETH para deployment
- ⏳ Ejecutar deployment a Base Sepolia

---

## 🚀 Pasos para Hacer Deployment

### **Paso 1: Configurar Wallet de Deployment** (5 minutos)

#### Opción A: Generar Nueva Wallet para Testnet (Recomendado)
```bash
# Generar nueva wallet
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"

# Guardar el output:
# Address: 0x... (esta es tu wallet address pública)
# Private Key: 0x... (esta es tu private key - GUARDAR SECRETO)
```

#### Opción B: Usar Wallet Existente (MetaMask)
```
1. Abrir MetaMask
2. Seleccionar una cuenta de TESTNET
3. Click en ⋮ → Account Details → Export Private Key
4. Ingresar password
5. Copiar private key (comienza con 0x...)
```

#### Actualizar .env
```bash
# Editar archivo .env
nano .env

# Actualizar estas líneas:
DEPLOYER_PRIVATE_KEY=0xTU_PRIVATE_KEY_AQUI  # ← Pegar tu private key
DEPLOYER=0xTU_ADDRESS_AQUI                   # ← Tu address pública

# Verificar que también estén configuradas:
ALCHEMY_API_KEY=tu_alchemy_api_key
BASESCAN_API_KEY=tu_basescan_api_key
```

⚠️ **IMPORTANTE:**
- Usar SOLO wallets de testnet
- NUNCA usar wallets con fondos reales
- NUNCA commitear el archivo .env a git (ya está en .gitignore)

---

### **Paso 2: Obtener Testnet ETH** (2 minutos)

Necesitas **0.05-0.1 ETH** en Base Sepolia para gas fees.

#### Faucets Disponibles:

1. **QuickNode** (0.1 ETH, instantáneo) ⭐ Recomendado
   ```
   https://faucet.quicknode.com/base/sepolia
   ```
   - Ingresar tu wallet address
   - Completar CAPTCHA
   - Recibir 0.1 ETH instantáneamente

2. **Alchemy** (0.5 ETH por día)
   ```
   https://sepoliafaucet.com
   ```
   - Requiere login con Alchemy
   - Recibir hasta 0.5 ETH

3. **Base Bridge** (desde Sepolia)
   ```
   https://bridge.base.org
   ```
   - Primero obtener Sepolia ETH
   - Luego bridge a Base Sepolia

#### Verificar Balance
```bash
# Método 1: Ver en explorer
https://sepolia.basescan.org/address/TU_ADDRESS

# Método 2: Usar script
npx ts-node scripts/check-balance.ts
```

---

### **Paso 3: Ejecutar Deployment** (5 minutos)

Una vez configurada la wallet y obtenido ETH:

```bash
# 1. Verificar configuración
npm run diagnose

# 2. Compilar contratos (si es necesario)
npm run compile

# 3. Ejecutar deployment a Base Sepolia
npm run deploy:baseSepolia

# Salida esperada:
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#    🚀 DEPLOYING TO BASE SEPOLIA
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# ✅ Factory deployed to: 0xAbC123...
# ⛽ Gas used: 1,234,567
# 💰 Gas cost: 0.00123 ETH
#
# ✅ Deployment complete!
```

#### En Caso de Error

**Error: Insufficient Funds**
```bash
# Solución: Obtener más ETH del faucet
https://faucet.quicknode.com/base/sepolia
```

**Error: Invalid API Key**
```bash
# Solución: Verificar ALCHEMY_API_KEY en .env
# Obtener nueva key en: https://dashboard.alchemy.com/
```

**Error: Nonce too low**
```bash
# Solución: Resetear deployment
npx hardhat deploy --network baseSepolia --reset
```

---

### **Paso 4: Verificar Contrato en Basescan** (Automático)

El script de deployment verifica automáticamente el contrato. Si falla:

```bash
# Verificación manual
npx hardhat verify --network baseSepolia 0xFACTORY_ADDRESS

# Verificar que aparezca en:
https://sepolia.basescan.org/address/0xFACTORY_ADDRESS
```

---

### **Paso 5: Post-Deployment Validation** (5 minutos)

```bash
# 1. Verificar que el contrato está desplegado
npx hardhat console --network baseSepolia

# En la consola:
const Factory = await ethers.getContractFactory("FuturaEventFactory");
const factory = Factory.attach("0xFACTORY_ADDRESS");
const totalEvents = await factory.getTotalEvents();
console.log("Total events:", totalEvents.toString()); // Debe ser 0

# 2. Crear evento de prueba
const tx = await factory.createNew(
  "0xYOUR_ADDRESS",
  "Test Event",
  100,
  "https://test.com/"
);
await tx.wait();
console.log("✅ Test event created!");

# 3. Verificar que el evento se creó
const newTotal = await factory.getTotalEvents();
console.log("New total:", newTotal.toString()); // Debe ser 1
```

---

### **Paso 6: Actualizar Configuración de Backends** (10 minutos)

Una vez desplegado exitosamente, actualizar las 4 APIs:

#### **futura-tickets-admin-api/.env**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=0xFACTORY_ADDRESS_AQUI
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_CHAIN_ID=84532
```

#### **futura-tickets-rest-api/.env**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=0xFACTORY_ADDRESS_AQUI
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_CHAIN_ID=84532
```

#### **futura-access-api/.env**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=0xFACTORY_ADDRESS_AQUI
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_CHAIN_ID=84532
```

#### **futura-market-place-api/.env**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=0xFACTORY_ADDRESS_AQUI
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_CHAIN_ID=84532
```

#### Reiniciar servicios
```bash
# Desde el directorio raíz del monorepo
./stop-all.sh
./start-all.sh
```

---

## 📊 Costos Estimados

### Deployment a Base Sepolia (Testnet)
- **Factory deployment:** ~0.002-0.005 ETH (~$0 USD - testnet)
- **Event creation:** ~0.002 ETH por evento
- **NFT minting:** ~0.0002 ETH por ticket

### Deployment a Base Mainnet (Futuro)
- **Factory deployment:** ~0.002-0.005 ETH (~$4-10 USD)
- **Event creation:** ~0.002 ETH (~$4 USD)
- **NFT minting:** ~0.0002 ETH (~$0.40 USD)

*(Precios basados en 1 ETH = $2,000 USD y 1 gwei gas price)*

---

## 🔐 Security Checklist

Antes de deployment a mainnet (no testnet):

- [ ] Auditoría profesional completada (Trail of Bits, OpenZeppelin, Consensys)
- [ ] Bug bounty program lanzado
- [ ] Multisig wallet configurado (Gnosis Safe)
- [ ] Plan de emergencia documentado
- [ ] Monitoring 24/7 configurado
- [ ] Seguro de smart contracts obtenido
- [ ] Legal review completado
- [ ] Team capacitado en respuesta a incidentes

---

## 📚 Documentación de Referencia

- **DEPLOYMENT_GUIDE.md** - Guía completa de deployment (500+ lines)
- **CHANGELOG.md** - Historial de cambios (v2.0.3)
- **GAS_OPTIMIZATIONS.md** - Optimizaciones realizadas
- **SECURITY.md** - Políticas de seguridad
- **AUDIT_FINDINGS.md** - Resultados de auditoría

---

## 🆘 Soporte

### Problemas Comunes

**"Cannot find module 'hardhat'"**
```bash
# Solución: Instalar dependencias
npm install
```

**"Network connection timeout"**
```bash
# Solución: Verificar ALCHEMY_API_KEY
# O usar otro RPC provider
```

**"Transaction underpriced"**
```bash
# Solución: Aumentar gas price en hardhat.config.ts
```

### Contacto

Si encuentras problemas:
1. Revisar DEPLOYMENT_GUIDE.md sección Troubleshooting
2. Verificar logs en `deployments/baseSepolia/`
3. Verificar status de Base Sepolia: https://base.statuspage.io/
4. Contactar al equipo de desarrollo

---

## ✅ Deployment Completado

Una vez desplegado exitosamente:

```bash
# Guardar información de deployment
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> DEPLOYMENTS.txt
echo "Base Sepolia Deployment - $(date)" >> DEPLOYMENTS.txt
echo "Factory Address: 0xYOUR_FACTORY_ADDRESS" >> DEPLOYMENTS.txt
echo "Deployer: 0xYOUR_DEPLOYER_ADDRESS" >> DEPLOYMENTS.txt
echo "Transaction: https://sepolia.basescan.org/tx/0xTX_HASH" >> DEPLOYMENTS.txt
echo "Block Number: 12345678" >> DEPLOYMENTS.txt
echo "Gas Used: 1234567" >> DEPLOYMENTS.txt
echo "Gas Cost: 0.00123 ETH" >> DEPLOYMENTS.txt
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> DEPLOYMENTS.txt
```

---

## 🎉 ¡Listo para Testnet!

El proyecto está **100% preparado** para deployment. Solo faltan:

1. ✅ Configurar tu wallet (Step 1)
2. ✅ Obtener testnet ETH (Step 2)
3. ✅ Ejecutar deployment (Step 3)

**Comando para deployment:**
```bash
npm run deploy:baseSepolia
```

---

**Versión:** 2.0.3
**Fecha:** 17 de Octubre, 2025
**Status:** ✅ READY TO DEPLOY

🚀 **¡Éxito con el deployment!**
