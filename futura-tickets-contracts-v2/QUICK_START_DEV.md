# 🚀 Quick Start - Development

> Get the blockchain node running in **2 minutes** for local development.

## ⚡ TL;DR

```bash
cd /Users/alejandrogarciacestero/Workspace/monorepo-futuratickets/futura-tickets-contracts-v2

# One command to rule them all
./start-blockchain.sh
```

**That's it!** Node running on `http://127.0.0.1:8545` ✅

---

## 🧪 Run Tests

```bash
npm test
# 18 passing ✅
```

---

## 📦 Export ABIs for Backend

```bash
npm run export-abis
# ABIs exported to /abi ✅
```

---

## 🔗 Backend Integration

### Use in your NestJS/Express backend:

```typescript
import FuturaEventFactoryABI from '../futura-tickets-contracts-v2/abi/FuturaEventFactory.json';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
const factoryAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Ready to interact!
```

**Full example:** `examples/backend-integration.ts`

---

## 🎯 Available Scripts

| Command | What it does |
|---------|--------------|
| `npm run chain` | Start Hardhat node |
| `npm test` | Run all tests (18 tests) |
| `npm run build` | Compile & export ABIs |
| `npm run healthcheck` | Check if node is alive |
| `npm run test:gas` | Gas usage report |

---

## 📚 More Info

- **Full terminal guide:** `TERMINAL_BLOCKCHAIN.md`
- **Integration examples:** `examples/backend-integration.ts`
- **Deployment:** `QUICK_START.md`

---

**Questions?** Read `TERMINAL_BLOCKCHAIN.md` or check `examples/`
