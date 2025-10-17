import { ethers } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function checkBalance() {
  try {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("   📊 CHECKING DEPLOYER WALLET STATUS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Get the deployer's address from private key
    const provider = new ethers.JsonRpcProvider(
      `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
    );

    if (!process.env.DEPLOYER_PRIVATE_KEY) {
      throw new Error("DEPLOYER_PRIVATE_KEY not found in .env");
    }

    const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
    const address = wallet.address;

    console.log("\n📍 Wallet Address:", address);

    const balance = await provider.getBalance(address);
    const balanceEth = ethers.formatEther(balance);

    console.log("💰 Balance:", balanceEth, "ETH");
    console.log("🌐 Network: Base Sepolia (Chain ID: 84532)");

    const balanceNum = parseFloat(balanceEth);

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (balanceNum >= 0.05) {
      console.log("✅ SUFFICIENT BALANCE FOR DEPLOYMENT");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      return true;
    } else {
      console.log("❌ INSUFFICIENT BALANCE");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("\n⚠️  Need at least 0.05 ETH for deployment");
      console.log("   Current balance:", balanceEth, "ETH\n");
      console.log("🔗 Get testnet ETH from these faucets:");
      console.log("   1. https://faucet.quicknode.com/base/sepolia (0.1 ETH)");
      console.log("   2. https://sepoliafaucet.com (0.5 ETH)");
      console.log("   3. https://bridge.base.org (bridge from Sepolia)\n");
      return false;
    }
  } catch (error: any) {
    console.error("\n❌ ERROR checking balance:", error.message);

    if (error.message.includes("invalid API key") || error.message.includes("unauthorized")) {
      console.error("\n⚠️  Check your ALCHEMY_API_KEY in .env file");
      console.error("   Get one from: https://dashboard.alchemy.com/");
    } else if (error.message.includes("DEPLOYER_PRIVATE_KEY")) {
      console.error("\n⚠️  DEPLOYER_PRIVATE_KEY not found in .env file");
    }

    return false;
  }
}

checkBalance()
  .then((success) => process.exit(success ? 0 : 1))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
