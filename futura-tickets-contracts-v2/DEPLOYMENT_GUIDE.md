# 🚀 Deployment Guide - Base Sepolia Testnet

**Version:** 2.0.3
**Target Network:** Base Sepolia (Testnet)
**Last Updated:** October 17, 2025
**Status:** Production Ready for Testnet

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#1-pre-deployment-checklist)
2. [Environment Setup](#2-environment-setup)
3. [Get Testnet ETH](#3-get-testnet-eth)
4. [Deployment Process](#4-deployment-process)
5. [Contract Verification](#5-contract-verification)
6. [Post-Deployment Validation](#6-post-deployment-validation)
7. [Integration with Backends](#7-integration-with-backends)
8. [Troubleshooting](#8-troubleshooting)
9. [Rollback Procedure](#9-rollback-procedure)
10. [Mainnet Deployment](#10-mainnet-deployment)

---

## 1. Pre-Deployment Checklist

Before deploying to Base Sepolia, ensure all items are checked:

### ✅ Code Quality
- [ ] All 49 tests passing (`npm test`)
- [ ] 0 Solhint warnings (`npm run lint`)
- [ ] Coverage > 80% (`npm run test:coverage`)
- [ ] Security audit completed (`npm run security:audit`)
- [ ] Gas optimization verified
- [ ] ABIs exported and synced (`npm run build`)

### ✅ Environment Setup
- [ ] `.env` file created from `.env.example`
- [ ] Alchemy API key configured
- [ ] Basescan API key configured
- [ ] Deployer private key set
- [ ] Deployer has testnet ETH (min. 0.1 ETH recommended)

### ✅ Network Configuration
- [ ] Base Sepolia RPC URL working
- [ ] Block explorer accessible (sepolia.basescan.org)
- [ ] Hardhat config validated (`npx hardhat compile`)

### ✅ Documentation
- [ ] Contract addresses will be recorded
- [ ] Deployment parameters documented
- [ ] Backend integration plan ready

### ✅ Security
- [ ] Private keys stored securely (password manager, hardware wallet)
- [ ] `.env` file NOT committed to git
- [ ] Deployer wallet address verified
- [ ] No mainnet keys mixed with testnet

---

## 2. Environment Setup

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Get API Keys

#### Alchemy API Key (Required)
1. Go to [dashboard.alchemy.com](https://dashboard.alchemy.com/)
2. Sign up or log in
3. Click "Create App"
4. Select:
   - Chain: **Base**
   - Network: **Base Sepolia (Testnet)**
   - Name: **FuturaTickets Testnet**
5. Copy API Key and add to `.env`:
   ```bash
   ALCHEMY_API_KEY=your_alchemy_api_key_here
   ```

#### Basescan API Key (Required for verification)
1. Go to [basescan.org](https://basescan.org/)
2. Sign up or log in
3. Navigate to "API-KEYs" in your account
4. Click "Add" to create a new API key
5. Copy API Key and add to `.env`:
   ```bash
   BASESCAN_API_KEY=your_basescan_api_key_here
   ```

### Step 3: Generate or Import Deployer Wallet

#### Option A: Generate New Wallet (Recommended for testing)
```bash
# Using Node.js
node -e "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('Address:', wallet.address); console.log('Private Key:', wallet.privateKey);"
```

#### Option B: Export from MetaMask
1. Open MetaMask
2. Click account menu → Account Details → Export Private Key
3. Enter password
4. **⚠️ NEVER share this key or commit it to git**

#### Add to `.env`:
```bash
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
DEPLOYER=0xYOUR_PUBLIC_ADDRESS_HERE
```

### Step 4: Verify Configuration

```bash
# Check environment variables
npm run diagnose

# Expected output:
# ✅ Node.js version check
# ✅ NPM packages installed
# ✅ Contracts compiled
# ✅ Environment variables set
# ✅ Network connectivity
```

---

## 3. Get Testnet ETH

Base Sepolia requires ETH for gas fees. You'll need approximately **0.05-0.1 ETH** for deployment.

### Recommended Faucets

#### Option 1: QuickNode Faucet (Recommended)
1. Visit: [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia)
2. Enter your deployer address: `0xYOUR_ADDRESS`
3. Complete CAPTCHA
4. Receive **0.1 ETH** instantly

#### Option 2: Alchemy Faucet
1. Visit: [sepoliafaucet.com](https://sepoliafaucet.com/)
2. Sign in with Alchemy account
3. Enter your address
4. Receive **0.5 ETH** per day

#### Option 3: Base Sepolia Bridge
1. Get Sepolia ETH from [sepolia-faucet.pk910.de](https://sepolia-faucet.pk910.de/)
2. Bridge to Base Sepolia: [bridge.base.org](https://bridge.base.org/)
3. Select "Sepolia → Base Sepolia"
4. Bridge your ETH

### Verify Balance

```bash
# Check balance using Alchemy dashboard
# OR use Hardhat console:
npx hardhat console --network baseSepolia

# In console:
const balance = await ethers.provider.getBalance("YOUR_ADDRESS");
console.log("Balance:", ethers.formatEther(balance), "ETH");
```

**Minimum Required:** 0.05 ETH
**Recommended:** 0.1 ETH (for deployment + testing)

---

## 4. Deployment Process

### Step 1: Final Pre-Deployment Checks

```bash
# 1. Clean build
npm run clean

# 2. Compile contracts
npm run compile

# 3. Run tests
npm test

# 4. Export ABIs
npm run export-abis

# Expected output:
# ✅ 49/49 tests passing
# ✅ Compiled 2 contracts
# ✅ ABIs exported
```

### Step 2: Deploy Factory Contract

```bash
# Deploy to Base Sepolia
npm run deploy:baseSepolia

# OR using enhanced deployment script
npm run deploy:enhanced -- --network baseSepolia
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   🚀 DEPLOYING TO BASE SEPOLIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏳ Pre-deployment validation...
✅ Alchemy API key set
✅ Basescan API key set
✅ Deployer private key set
✅ Balance: 0.1 ETH
✅ Network: Base Sepolia (84532)

⏳ Deploying FuturaEventFactory...
✅ Factory deployed to: 0xAbC123...
📝 Transaction hash: 0xDef456...
⛽ Gas used: 1,234,567
💰 Gas cost: 0.00123 ETH

✅ Deployment complete!
📁 Address saved to: deployments/baseSepolia/FuturaEventFactory.json
```

### Step 3: Record Contract Addresses

The deployment script automatically saves addresses to:
- `deployments/baseSepolia/FuturaEventFactory.json`
- `abi/deployments.json` (for backends)

**Manual Backup (Recommended):**
```bash
# Create deployment record
echo "Base Sepolia Deployment - $(date)" >> DEPLOYMENTS.txt
echo "Factory: 0xYOUR_FACTORY_ADDRESS" >> DEPLOYMENTS.txt
echo "Deployer: $DEPLOYER" >> DEPLOYMENTS.txt
echo "---" >> DEPLOYMENTS.txt
```

### Step 4: Estimate Deployment Costs

**Estimated Gas Usage:**
- Factory deployment: ~1,500,000 gas
- Event creation: ~2,000,000 gas per event
- NFT minting: ~195,000 gas per ticket

**Cost Calculation (at 1 gwei gas price):**
- Factory: ~0.0015 ETH (~$3 USD)
- Event: ~0.002 ETH (~$4 USD)
- Mint: ~0.000195 ETH (~$0.40 USD)

---

## 5. Contract Verification

Verify contracts on Basescan for transparency and easier interaction.

### Step 1: Automatic Verification

The enhanced deployment script auto-verifies. If it failed, verify manually:

```bash
# Verify Factory
npx hardhat verify --network baseSepolia 0xYOUR_FACTORY_ADDRESS

# Expected output:
# Successfully submitted source code for contract
# contracts/FuturaEventFactory.sol:FuturaEventFactory at 0xYOUR_FACTORY_ADDRESS
# for verification on the block explorer. Waiting for verification result...
#
# Successfully verified contract FuturaEventFactory on Etherscan.
# https://sepolia.basescan.org/address/0xYOUR_FACTORY_ADDRESS#code
```

### Step 2: Verify Individual Event Contracts

After creating an event via the factory:

```bash
# Get event contract address from factory logs
# Then verify:
npx hardhat verify --network baseSepolia \
  0xEVENT_CONTRACT_ADDRESS \
  "0xOWNER_ADDRESS" \
  "Event Name" \
  1000 \
  "https://metadata.futuratickets.com/"

# Constructor arguments:
# - owner: Promoter address
# - eventName: Name of the event
# - maxSupply: Maximum tickets (e.g., 1000)
# - baseURI: Metadata URI
```

### Step 3: Verify on Basescan

1. Go to: [sepolia.basescan.org/address/YOUR_ADDRESS](https://sepolia.basescan.org/address/YOUR_ADDRESS)
2. Click "Contract" tab
3. You should see:
   - ✅ "Contract Source Code Verified"
   - ✅ Green checkmark
   - ✅ "Read Contract" and "Write Contract" tabs

---

## 6. Post-Deployment Validation

### Step 1: Validate Factory Contract

```bash
# Using Hardhat console
npx hardhat console --network baseSepolia
```

```javascript
// Get factory contract
const Factory = await ethers.getContractFactory("FuturaEventFactory");
const factory = Factory.attach("0xYOUR_FACTORY_ADDRESS");

// 1. Check deployment
console.log("Factory address:", await factory.getAddress());

// 2. Check event count (should be 0 initially)
const totalEvents = await factory.getTotalEvents();
console.log("Total events:", totalEvents.toString()); // Should be 0

// 3. Test event creation
const tx = await factory.createNew(
  "0xYOUR_ADDRESS",           // owner
  "Test Event",               // event name
  100,                        // max supply
  "https://test.com/"         // base URI
);
const receipt = await tx.wait();
console.log("Event created at:", receipt.logs[0].args[1]); // Event address

// 4. Verify event count increased
const newTotal = await factory.getTotalEvents();
console.log("Total events:", newTotal.toString()); // Should be 1
```

### Step 2: Validate Event Contract

```javascript
// Get event contract from factory
const eventAddress = await factory.getEventContract(1);
console.log("Event address:", eventAddress);

// Attach to event contract
const Event = await ethers.getContractFactory("FuturaEvent");
const event = Event.attach(eventAddress);

// 1. Check ownership
const owner = await event.owner();
console.log("Owner:", owner); // Should match your address

// 2. Check max supply
const maxSupply = await event.MAX_SUPPLY();
console.log("Max supply:", maxSupply.toString()); // Should be 100

// 3. Check total supply (should be 0)
const totalSupply = await event.totalSupply();
console.log("Total supply:", totalSupply.toString()); // Should be 0

// 4. Test minting
const mintTx = await event.mintNFT(
  ethers.parseEther("0.1"),    // price
  "0xRECIPIENT_ADDRESS",       // client
  5,                           // 5% royalty
  Date.now(),                  // timestamp
  0                            // OPEN status
);
await mintTx.wait();
console.log("✅ Minting successful");

// 5. Verify total supply increased
const newSupply = await event.totalSupply();
console.log("New total supply:", newSupply.toString()); // Should be 1
```

### Step 3: Test All Core Functions

Create a validation script:

```bash
npx ts-node scripts/validate-deployment.ts --network baseSepolia
```

**Expected Validations:**
- ✅ Factory deployment verified
- ✅ Event creation works
- ✅ NFT minting works
- ✅ Price setting works
- ✅ Transfer works
- ✅ Status changes work
- ✅ Royalty info correct
- ✅ Pause/unpause works

---

## 7. Integration with Backends

### Step 1: Update Backend Environment Variables

Update `.env` in all 4 backend services:

```bash
# futura-tickets-admin-api/.env
BLOCKCHAIN_FACTORY_ADDRESS=0xYOUR_FACTORY_ADDRESS
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BLOCKCHAIN_CHAIN_ID=84532

# futura-tickets-rest-api/.env
BLOCKCHAIN_FACTORY_ADDRESS=0xYOUR_FACTORY_ADDRESS
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# futura-access-api/.env
BLOCKCHAIN_FACTORY_ADDRESS=0xYOUR_FACTORY_ADDRESS
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# futura-market-place-api/.env
BLOCKCHAIN_FACTORY_ADDRESS=0xYOUR_FACTORY_ADDRESS
BLOCKCHAIN_NETWORK=baseSepolia
BLOCKCHAIN_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Step 2: Sync ABIs

ABIs are automatically synced during build, but verify:

```bash
# From contracts directory
npm run sync-abis

# Verify ABIs in each backend:
ls ../futura-tickets-admin-api/abi/
ls ../futura-tickets-rest-api/abi/
ls ../futura-access-api/abi/
ls ../futura-market-place-api/abi/

# Should see:
# - FuturaEvent.json
# - FuturaEventFactory.json
# - index.ts
```

### Step 3: Test Backend Integration

```bash
# 1. Start all backends
cd .. && ./start-all.sh

# 2. Test factory interaction via API
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Event",
    "maxSupply": 100,
    "promoterId": "..."
  }'

# 3. Verify event created on blockchain
# Check Basescan: https://sepolia.basescan.org/address/0xFACTORY_ADDRESS
```

### Step 4: Update Frontend Configuration

```typescript
// frontend/src/config/blockchain.ts
export const BLOCKCHAIN_CONFIG = {
  network: 'baseSepolia',
  chainId: 84532,
  rpcUrl: 'https://base-sepolia.g.alchemy.com/v2/YOUR_KEY',
  factoryAddress: '0xYOUR_FACTORY_ADDRESS',
  blockExplorer: 'https://sepolia.basescan.org',
};
```

---

## 8. Troubleshooting

### Problem: Deployment Fails with "Insufficient Funds"

**Solution:**
1. Check balance: `npm run diagnose`
2. Get more testnet ETH from faucet
3. Ensure you have at least 0.05 ETH

### Problem: "Invalid API Key" Error

**Solution:**
1. Verify API keys in `.env`:
   ```bash
   echo $ALCHEMY_API_KEY
   echo $BASESCAN_API_KEY
   ```
2. Ensure no extra spaces or quotes
3. Regenerate keys if necessary

### Problem: Contract Verification Fails

**Solutions:**
1. **Wait 1-2 minutes** after deployment (block confirmation)
2. **Check compiler version matches:**
   ```bash
   npx hardhat verify --list-networks
   ```
3. **Verify manually on Basescan:**
   - Go to contract address
   - Click "Verify & Publish"
   - Upload flattened contract: `npx hardhat flatten`
   - Match compiler version (0.8.25) and optimization settings

### Problem: "Nonce Too Low" Error

**Solution:**
```bash
# Reset nonce
npx hardhat console --network baseSepolia

const nonce = await ethers.provider.getTransactionCount("YOUR_ADDRESS", "latest");
console.log("Current nonce:", nonce);

# Use --reset flag
npx hardhat deploy --network baseSepolia --reset
```

### Problem: Gas Estimation Fails

**Solution:**
1. Check network status: [base.statuspage.io](https://base.statuspage.io/)
2. Increase gas limit in hardhat.config.ts:
   ```typescript
   baseSepolia: {
     gas: 8000000,
     gasPrice: 1000000000, // 1 gwei
   }
   ```

---

## 9. Rollback Procedure

If deployment fails or issues are found:

### Step 1: Document the Issue
```bash
echo "Rollback: $(date)" >> ROLLBACK.txt
echo "Reason: [DESCRIPTION]" >> ROLLBACK.txt
echo "Failed Address: 0xFAILED_ADDRESS" >> ROLLBACK.txt
```

### Step 2: Deploy New Version
```bash
# Fix issues in contracts
# Re-run tests
npm test

# Deploy again (new address)
npm run deploy:baseSepolia
```

### Step 3: Update All References
- Update backend `.env` files
- Update frontend config
- Update documentation
- Notify team

### Step 4: Pause Old Contract (if needed)
```bash
npx hardhat console --network baseSepolia

const factory = await ethers.getContractAt("FuturaEventFactory", "OLD_ADDRESS");
// Note: Factory doesn't have pause, but event contracts do
```

---

## 10. Mainnet Deployment

**⚠️ DO NOT DEPLOY TO MAINNET WITHOUT:**

### Pre-Mainnet Checklist
- [ ] Professional security audit completed (Trail of Bits, OpenZeppelin, etc.)
- [ ] All audit findings resolved
- [ ] Extensive testnet testing (minimum 2 weeks)
- [ ] Bug bounty program launched
- [ ] Legal review completed
- [ ] Insurance policy secured
- [ ] Multisig wallet setup (Gnosis Safe)
- [ ] Emergency pause plan documented
- [ ] 24/7 monitoring setup
- [ ] Team trained on emergency procedures

### Mainnet Deployment Steps

**Use `deploy:base` script:**
```bash
# Ensure mainnet keys in .env
npm run deploy:base

# Follow same validation steps as testnet
# Document everything
```

### Post-Mainnet Actions
1. **Immediate:**
   - Transfer ownership to multisig
   - Verify contracts on Basescan
   - Update all frontend/backend configs
   - Monitor transactions closely

2. **First 24 hours:**
   - 24/7 team availability
   - Monitor all transactions
   - Watch for anomalies
   - Prepare to pause if needed

3. **First week:**
   - Daily security checks
   - Monitor gas costs
   - Gather user feedback
   - Document any issues

---

## 📚 Additional Resources

- **Base Sepolia Faucet:** [faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia)
- **Base Sepolia Explorer:** [sepolia.basescan.org](https://sepolia.basescan.org)
- **Base Docs:** [docs.base.org](https://docs.base.org)
- **Hardhat Docs:** [hardhat.org/docs](https://hardhat.org/docs)
- **OpenZeppelin Docs:** [docs.openzeppelin.com](https://docs.openzeppelin.com)

## 🆘 Support

If you encounter issues:
1. Check [Troubleshooting](#8-troubleshooting) section
2. Review deployment logs in `deployments/baseSepolia/`
3. Check Base Sepolia status: [base.statuspage.io](https://base.statuspage.io/)
4. Contact development team

---

**Last Updated:** October 17, 2025
**Version:** 2.0.3
**Status:** ✅ Ready for Base Sepolia Deployment

🚀 **Happy Deploying!**
