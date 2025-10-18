# 🚀 Deployment Status - FuturaTickets Contracts v2.0.3

**Date:** October 18, 2025
**Developer:** Principal
**Target Network:** Base Sepolia Testnet

---

## ✅ Completed Steps

### 1. Project Configuration ✅
- Contracts compiled successfully
- ABIs exported and synced to 4 backends
- 49/49 tests passing
- 0 Solhint warnings
- Gas optimizations implemented

### 2. Testnet Wallet Generated ✅

```
📍 Wallet Address: 0xe76b32112360218dBdD4E5f8b0C6a54A49587BCc
🔑 Private Key: 0x2e14cbd0bd2f17b2ee81e2bc14511c9b3756e0aad146db172eba97caec114110

⚠️  TESTNET ONLY - DO NOT USE FOR MAINNET
⚠️  Already configured in .env file
```

### 3. Environment Configuration ✅
- `.env` file updated with wallet credentials
- Deployment scripts ready
- Hardhat configuration verified

### 4. Local Deployment Test ✅

```bash
# Successfully deployed to Hardhat network (in-memory)
✅ FuturaEventFactory deployed!
Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Gas Used: 2,472,687
```

---

## ⏳ Pending Steps (Required for Base Sepolia Deployment)

### Step 1: Obtain Alchemy API Key (2 minutes)

**Action Required:**
1. Visit: https://dashboard.alchemy.com/
2. Create free account (email or GitHub)
3. Click "Create new app"
4. Configure:
   - **Chain:** Base
   - **Network:** Base Sepolia (testnet)
   - **Name:** FuturaTickets
5. Copy the **API KEY**

**Then update .env:**
```bash
ALCHEMY_API_KEY=<your_key_here>
```

---

### Step 2: Obtain Basescan API Key (2 minutes)

**Action Required:**
1. Visit: https://basescan.org/register
2. Create account (verify email)
3. Go to: https://basescan.org/myapikey
4. Click "Add" to create new API key
5. Copy the generated key

**Then update .env:**
```bash
BASESCAN_API_KEY=<your_key_here>
```

---

### Step 3: Get Testnet ETH (1 minute)

**Wallet to fund:**
```
0xe76b32112360218dBdD4E5f8b0C6a54A49587BCc
```

**Recommended faucets:**

1. **QuickNode (Best - Instant 0.1 ETH)**
   - URL: https://faucet.quicknode.com/base/sepolia
   - Simply paste wallet address
   - Complete CAPTCHA
   - Receive 0.1 ETH instantly

2. **Alchemy Faucet (0.5 ETH/day)**
   - URL: https://sepoliafaucet.com
   - Requires Alchemy account
   - Higher daily limit

3. **Base Bridge (from Sepolia)**
   - URL: https://bridge.base.org
   - First get Sepolia ETH
   - Bridge to Base Sepolia

**Verify balance:**
```bash
npx ts-node scripts/check-balance.ts
```

---

## 🚀 Deployment Commands (Once Prerequisites Complete)

### Pre-Deployment Validation
```bash
# Run automated checks
npm run pre-deploy

# Expected output: All checks passing
# ✅ Environment variables configured
# ✅ Contracts compiled
# ✅ Tests passing
# ✅ Sufficient balance
```

### Deploy to Base Sepolia
```bash
# Deploy Factory contract
npm run deploy:baseSepolia

# Expected output:
# ============================================================
# Deploying FuturaEventFactory...
# Deployer: 0xe76b32112360218dBdD4E5f8b0C6a54A49587BCc
# ============================================================
# ✅ FuturaEventFactory deployed!
# Address: 0x... (save this!)
# Transaction: 0x...
# ============================================================
#
# 📝 Save this address to your backend .env:
# FACTORY_CONTRACT_ADDRESS=0x...
```

### Verify Contract (Automatic)
The deployment script automatically verifies on Basescan. If it fails:

```bash
# Manual verification
npx hardhat verify --network baseSepolia <FACTORY_ADDRESS>

# Check on explorer
https://sepolia.basescan.org/address/<FACTORY_ADDRESS>
```

---

## 📋 Post-Deployment Checklist

After successful deployment:

### 1. Save Contract Addresses
```bash
# Add to deployment log
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> DEPLOYMENTS.txt
echo "Base Sepolia Deployment - $(date)" >> DEPLOYMENTS.txt
echo "Factory Address: <ADDRESS_HERE>" >> DEPLOYMENTS.txt
echo "Deployer: 0xe76b32112360218dBdD4E5f8b0C6a54A49587BCc" >> DEPLOYMENTS.txt
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >> DEPLOYMENTS.txt
```

### 2. Update Backend Configurations

Update `.env` in each backend:

**futura-tickets-admin-api/.env:**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=<DEPLOYED_ADDRESS>
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
BLOCKCHAIN_CHAIN_ID=84532
```

**futura-tickets-rest-api/.env:**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=<DEPLOYED_ADDRESS>
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
BLOCKCHAIN_CHAIN_ID=84532
```

**futura-access-api/.env:**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=<DEPLOYED_ADDRESS>
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
BLOCKCHAIN_CHAIN_ID=84532
```

**futura-market-place-api/.env:**
```bash
BLOCKCHAIN_FACTORY_ADDRESS=<DEPLOYED_ADDRESS>
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/<YOUR_ALCHEMY_KEY>
BLOCKCHAIN_CHAIN_ID=84532
```

### 3. Restart Services
```bash
# From monorepo root
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets
./stop-all.sh
./start-all.sh
```

### 4. Test Integration
```bash
# Create test event via API
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "maxSupply": 100
  }'

# Verify event created on blockchain
```

---

## 📊 Estimated Costs

### Base Sepolia (Testnet)
- **Factory Deployment:** ~0.002-0.005 ETH (~$0 - testnet)
- **Event Creation:** ~0.002 ETH per event
- **NFT Minting:** ~0.0002 ETH per ticket

**Total for deployment + testing:** ~0.01 ETH (free from faucet)

---

## 🔍 Verification & Monitoring

### Check Deployment Status
```bash
# View on Basescan
https://sepolia.basescan.org/address/<FACTORY_ADDRESS>

# Check factory info
npx hardhat console --network baseSepolia

# In console:
const Factory = await ethers.getContractFactory("FuturaEventFactory");
const factory = Factory.attach("<FACTORY_ADDRESS>");
const total = await factory.getTotalEvents();
console.log("Total events:", total.toString());
```

### Monitor Transactions
```bash
# Watch for FuturaEventCreated events
npm run monitor

# Or use Basescan directly
https://sepolia.basescan.org/address/<FACTORY_ADDRESS>#events
```

---

## 🆘 Troubleshooting

### Issue: "Insufficient funds for gas"
**Solution:** Get more testnet ETH from faucet
```bash
https://faucet.quicknode.com/base/sepolia
```

### Issue: "Invalid API key"
**Solution:** Verify ALCHEMY_API_KEY in .env
```bash
# Check key is correct
cat .env | grep ALCHEMY_API_KEY

# Get new key from
https://dashboard.alchemy.com/
```

### Issue: "Network connection timeout"
**Solution:** Check network status
```bash
# Verify Base Sepolia is online
https://base.statuspage.io/

# Try alternative RPC
# Update hardhat.config.ts with backup RPC URL
```

### Issue: "Verification failed"
**Solution:** Manually verify contract
```bash
# Wait 1-2 minutes after deployment
# Then verify manually
npx hardhat verify --network baseSepolia <FACTORY_ADDRESS>
```

---

## 📞 Quick Reference

### Wallet Info
```
Address: 0xe76b32112360218dBdD4E5f8b0C6a54A49587BCc
Private Key: (in .env - DO NOT SHARE)
Network: Base Sepolia (Chain ID: 84532)
```

### Useful Links
- **Base Sepolia Explorer:** https://sepolia.basescan.org/
- **Base Sepolia Faucet:** https://faucet.quicknode.com/base/sepolia
- **Alchemy Dashboard:** https://dashboard.alchemy.com/
- **Base Network Status:** https://base.statuspage.io/
- **Basescan API Keys:** https://basescan.org/myapikey

### NPM Commands
```bash
npm run compile         # Compile contracts
npm run test           # Run all tests
npm run pre-deploy     # Pre-deployment validation
npm run deploy:baseSepolia  # Deploy to Base Sepolia
npm run verify:baseSepolia  # Verify contract
npx ts-node scripts/check-balance.ts  # Check wallet balance
```

---

## ✅ Next Steps Summary

**To complete Base Sepolia deployment:**

1. **Get Alchemy API Key** → Update .env
2. **Get Basescan API Key** → Update .env
3. **Get Testnet ETH** → Fund wallet (0.1 ETH)
4. **Run deployment:** `npm run deploy:baseSepolia`
5. **Update backends** → 4 .env files
6. **Test integration** → Create event via API

**Total time:** ~10 minutes
**Total cost:** $0 (testnet)

---

**Status:** ⏸️ **Waiting for API Keys & Testnet ETH**
**Next Command:** `npm run deploy:baseSepolia`

---

**For detailed instructions, see:**
- `READY_TO_DEPLOY.md` - Quick start guide
- `DEPLOYMENT_GUIDE.md` - Comprehensive deployment guide
- `PROJECT_STATUS.md` - Full project status
