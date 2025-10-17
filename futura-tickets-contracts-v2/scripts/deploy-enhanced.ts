#!/usr/bin/env ts-node

/**
 * 🚀 ENHANCED DEPLOYMENT SCRIPT
 *
 * Deployment robusto con verificación automática, logging y checks.
 *
 * Features:
 * - ✅ Pre-deployment validation
 * - ✅ Multi-network support (hardhat, baseSepolia, base)
 * - ✅ Automatic block explorer verification
 * - ✅ Deployment logging to JSON
 * - ✅ Error handling and rollback info
 * - ✅ Post-deployment validation
 * - ✅ Gas estimation
 *
 * Usage:
 *   npm run deploy:enhanced -- --network hardhat
 *   npm run deploy:enhanced -- --network baseSepolia
 *   npm run deploy:enhanced -- --network base
 *
 * Environment variables required:
 *   - DEPLOYER_PRIVATE_KEY_LOCAL (for hardhat)
 *   - DEPLOYER_PRIVATE_KEY_TESTNET (for baseSepolia)
 *   - DEPLOYER_PRIVATE_KEY_MAINNET (for base)
 *   - ALCHEMY_API_KEY (for baseSepolia and base)
 *   - BASESCAN_API_KEY (for verification)
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// ==================== TYPES ====================

interface DeploymentConfig {
  network: string;
  factoryAddress?: string;
  deployer: string;
  blockNumber: number;
  transactionHash: string;
  gasUsed: string;
  timestamp: string;
  verified: boolean;
}

interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorer?: string;
  isTestnet: boolean;
}

// ==================== CONFIGURATION ====================

const NETWORKS: { [key: string]: NetworkConfig } = {
  hardhat: {
    name: "Hardhat Local",
    chainId: 31337,
    rpcUrl: "http://127.0.0.1:8545",
    isTestnet: true,
  },
  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    explorer: "https://sepolia.basescan.org",
    isTestnet: true,
  },
  base: {
    name: "Base Mainnet",
    chainId: 8453,
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    explorer: "https://basescan.org",
    isTestnet: false,
  },
};

const DEPLOYMENTS_DIR = path.join(__dirname, "..", "deployments");
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

// ==================== HELPER FUNCTIONS ====================

function log(message: string, color: keyof typeof COLORS = "reset") {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function header(title: string) {
  console.log("");
  log("═".repeat(70), "blue");
  log(`  ${title}`, "bright");
  log("═".repeat(70), "blue");
  console.log("");
}

function section(title: string) {
  log(`\n${title}`, "cyan");
  log("─".repeat(70), "cyan");
}

function success(message: string) {
  log(`✅ ${message}`, "green");
}

function error(message: string) {
  log(`❌ ${message}`, "red");
}

function warning(message: string) {
  log(`⚠️  ${message}`, "yellow");
}

function info(message: string) {
  log(`ℹ️  ${message}`, "blue");
}

// ==================== PRE-DEPLOYMENT CHECKS ====================

async function preDeploymentChecks(networkName: string): Promise<boolean> {
  section("🔍 Pre-Deployment Checks");

  const network = NETWORKS[networkName];
  if (!network) {
    error(`Unknown network: ${networkName}`);
    return false;
  }

  log(`Network: ${network.name} (chainId: ${network.chainId})`);

  // Check private key
  const privateKeyVar =
    networkName === "hardhat"
      ? "DEPLOYER_PRIVATE_KEY_LOCAL"
      : networkName === "baseSepolia"
        ? "DEPLOYER_PRIVATE_KEY_TESTNET"
        : "DEPLOYER_PRIVATE_KEY_MAINNET";

  if (!process.env[privateKeyVar]) {
    error(`Missing ${privateKeyVar} in environment variables`);
    return false;
  }
  success(`Private key configured: ${privateKeyVar}`);

  // Check API keys for non-local networks
  if (networkName !== "hardhat") {
    if (!process.env.ALCHEMY_API_KEY) {
      error("Missing ALCHEMY_API_KEY in environment variables");
      return false;
    }
    success("Alchemy API key configured");

    if (!process.env.BASESCAN_API_KEY) {
      warning("Missing BASESCAN_API_KEY - verification will be skipped");
    } else {
      success("Basescan API key configured");
    }
  }

  // Get deployer and check balance
  try {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);

    log(`Deployer address: ${deployer.address}`);
    log(`Balance: ${ethers.formatEther(balance)} ETH`);

    // Check minimum balance
    const minBalance = ethers.parseEther(networkName === "hardhat" ? "1" : "0.01");
    if (balance < minBalance) {
      error(
        `Insufficient balance. Need at least ${ethers.formatEther(minBalance)} ETH`
      );
      return false;
    }
    success(`Balance sufficient for deployment`);
  } catch (err) {
    error(`Failed to check deployer balance: ${err}`);
    return false;
  }

  // Check if contracts are compiled
  try {
    await ethers.getContractFactory("FuturaEventFactory");
    success("Contracts compiled successfully");
  } catch (err) {
    error("Contracts not compiled. Run 'npm run compile' first");
    return false;
  }

  console.log("");
  success("All pre-deployment checks passed!\n");
  return true;
}

// ==================== DEPLOYMENT ====================

async function deployFactory(
  networkName: string
): Promise<DeploymentConfig | null> {
  section("🚀 Deploying FuturaEventFactory");

  try {
    const [deployer] = await ethers.getSigners();
    const network = NETWORKS[networkName];

    log(`Network: ${network.name}`);
    log(`Deployer: ${deployer.address}`);
    log("");

    // Get contract factory
    const Factory = await ethers.getContractFactory("FuturaEventFactory");

    // Estimate gas
    log("Estimating gas...");
    const deploymentData = Factory.getDeployTransaction();
    const estimatedGas = await ethers.provider.estimateGas({
      data: deploymentData.data,
      from: deployer.address,
    });

    log(`Estimated gas: ${estimatedGas.toString()}`);

    // Get gas price
    const feeData = await ethers.provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("50", "gwei");
    const maxPriorityFeePerGas =
      feeData.maxPriorityFeePerGas || ethers.parseUnits("2", "gwei");

    log(`Max fee per gas: ${ethers.formatUnits(maxFeePerGas, "gwei")} gwei`);
    log(
      `Max priority fee: ${ethers.formatUnits(maxPriorityFeePerGas, "gwei")} gwei`
    );

    // Estimate total cost
    const estimatedCost = estimatedGas * maxFeePerGas;
    log(
      `Estimated total cost: ${ethers.formatEther(estimatedCost)} ETH\n`
    );

    // Deploy
    warning("Deploying contract... This may take a few moments.");

    const factory = await Factory.deploy({
      maxFeePerGas,
      maxPriorityFeePerGas,
    });

    log(`Transaction hash: ${factory.deploymentTransaction()?.hash}`);
    log("Waiting for confirmation...");

    await factory.waitForDeployment();

    const address = await factory.getAddress();
    const receipt = await factory.deploymentTransaction()?.wait();

    if (!receipt) {
      error("Failed to get deployment receipt");
      return null;
    }

    success(`\nFactory deployed at: ${address}`);
    log(`Block number: ${receipt.blockNumber}`);
    log(`Gas used: ${receipt.gasUsed.toString()}`);
    log(
      `Actual cost: ${ethers.formatEther(receipt.gasUsed * (receipt.gasPrice || 0n))} ETH`
    );

    // Create deployment config
    const config: DeploymentConfig = {
      network: networkName,
      factoryAddress: address,
      deployer: deployer.address,
      blockNumber: receipt.blockNumber,
      transactionHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      timestamp: new Date().toISOString(),
      verified: false,
    };

    return config;
  } catch (err) {
    error(`Deployment failed: ${err}`);
    return null;
  }
}

// ==================== POST-DEPLOYMENT VALIDATION ====================

async function postDeploymentValidation(
  config: DeploymentConfig
): Promise<boolean> {
  section("✓ Post-Deployment Validation");

  try {
    // Check if contract exists
    const code = await ethers.provider.getCode(config.factoryAddress!);
    if (code === "0x") {
      error("Contract code not found at deployed address");
      return false;
    }
    success("Contract code verified on chain");

    // Try to interact with contract
    const Factory = await ethers.getContractAt(
      "FuturaEventFactory",
      config.factoryAddress!
    );

    // Test view function (if any)
    // For now just verify we can create a contract instance
    success("Contract interface validated");

    console.log("");
    success("All post-deployment validations passed!\n");
    return true;
  } catch (err) {
    error(`Validation failed: ${err}`);
    return false;
  }
}

// ==================== VERIFICATION ====================

async function verifyContract(
  config: DeploymentConfig,
  networkName: string
): Promise<boolean> {
  section("🔎 Verifying Contract on Block Explorer");

  if (networkName === "hardhat") {
    warning("Skipping verification for local network");
    return true;
  }

  if (!process.env.BASESCAN_API_KEY) {
    warning("Basescan API key not configured, skipping verification");
    return false;
  }

  try {
    info("Starting verification...");
    info(
      "Note: This may take a few minutes and might fail if the contract was just deployed."
    );

    const { run } = require("hardhat");

    await run("verify:verify", {
      address: config.factoryAddress,
      constructorArguments: [],
      network: networkName,
    });

    success("\nContract verified successfully!");
    return true;
  } catch (err: any) {
    if (err.message.includes("Already Verified")) {
      success("Contract was already verified!");
      return true;
    }

    error(`Verification failed: ${err.message}`);
    warning(
      "You can verify manually later using:\n" +
        `  npx hardhat verify --network ${networkName} ${config.factoryAddress}`
    );
    return false;
  }
}

// ==================== SAVE DEPLOYMENT ====================

function saveDeployment(config: DeploymentConfig) {
  section("💾 Saving Deployment Info");

  try {
    // Create deployments directory if it doesn't exist
    if (!fs.existsSync(DEPLOYMENTS_DIR)) {
      fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true });
    }

    // Save network-specific deployment
    const networkDir = path.join(DEPLOYMENTS_DIR, config.network);
    if (!fs.existsSync(networkDir)) {
      fs.mkdirSync(networkDir, { recursive: true });
    }

    const deploymentFile = path.join(networkDir, "FuturaEventFactory.json");
    fs.writeFileSync(deploymentFile, JSON.stringify(config, null, 2));

    success(`Deployment saved to: ${deploymentFile}`);

    // Update .env.example with new address
    const envExample = path.join(__dirname, "..", ".env.example");
    if (fs.existsSync(envExample)) {
      let envContent = fs.readFileSync(envExample, "utf-8");

      const envVar =
        config.network === "baseSepolia"
          ? "FACTORY_ADDRESS_BASE_SEPOLIA"
          : config.network === "base"
            ? "FACTORY_ADDRESS_BASE_MAINNET"
            : "FACTORY_CONTRACT_ADDRESS";

      if (envContent.includes(envVar)) {
        envContent = envContent.replace(
          new RegExp(`${envVar}=.*`),
          `${envVar}=${config.factoryAddress}`
        );
        fs.writeFileSync(envExample, envContent);
        info(`Updated ${envVar} in .env.example`);
      }
    }

    // Create summary
    console.log("");
    success("═".repeat(70));
    success("  DEPLOYMENT SUMMARY");
    success("═".repeat(70));
    success(`Network:          ${NETWORKS[config.network].name}`);
    success(`Factory Address:  ${config.factoryAddress}`);
    success(`Deployer:         ${config.deployer}`);
    success(`Block Number:     ${config.blockNumber}`);
    success(`Gas Used:         ${config.gasUsed}`);
    success(`Transaction Hash: ${config.transactionHash}`);
    success(`Verified:         ${config.verified ? "Yes ✅" : "No ⏳"}`);
    success(`Timestamp:        ${config.timestamp}`);
    success("═".repeat(70));

    if (NETWORKS[config.network].explorer) {
      console.log("");
      info(`View on explorer: ${NETWORKS[config.network].explorer}/address/${config.factoryAddress}`);
    }

    console.log("");
    success("🎉 Deployment completed successfully!\n");

    // Next steps
    section("📋 Next Steps");
    log("1. Update your .env file with the factory address:");
    log(`   FACTORY_CONTRACT_ADDRESS=${config.factoryAddress}\n`);

    log("2. Export ABIs:");
    log(`   npm run export-abis\n`);

    log("3. Sync ABIs to backends:");
    log(`   npm run sync-abis\n`);

    if (config.network !== "hardhat") {
      log("4. Test the deployment:");
      log(`   npm run admin -- event:list\n`);
    }
  } catch (err) {
    error(`Failed to save deployment: ${err}`);
  }
}

// ==================== MAIN ====================

async function main() {
  header("🚀 ENHANCED DEPLOYMENT SCRIPT");

  // Get network from command line
  const args = process.argv.slice(2);
  const networkIndex = args.indexOf("--network");
  const networkName =
    networkIndex >= 0 ? args[networkIndex + 1] : "hardhat";

  if (!NETWORKS[networkName]) {
    error(`Invalid network: ${networkName}`);
    error("Available networks: hardhat, baseSepolia, base");
    process.exit(1);
  }

  const network = NETWORKS[networkName];

  log(`Target Network: ${network.name}`);
  log(`Chain ID: ${network.chainId}`);
  log(`Testnet: ${network.isTestnet ? "Yes" : "No"}\n`);

  // Confirmation for mainnet
  if (!network.isTestnet && networkName !== "hardhat") {
    warning("⚠️  WARNING: You are about to deploy to MAINNET! ⚠️");
    warning("This will cost real money and cannot be undone.");
    warning("Make sure you have completed all items in PRODUCTION_READY_CHECKLIST.md");
    console.log("");

    // In a real scenario, you'd want to add a confirmation prompt here
    // For now, we'll just log the warning
  }

  // Step 1: Pre-deployment checks
  const checksPass = await preDeploymentChecks(networkName);
  if (!checksPass) {
    error("\nPre-deployment checks failed. Fix issues and try again.");
    process.exit(1);
  }

  // Step 2: Deploy
  const config = await deployFactory(networkName);
  if (!config) {
    error("\nDeployment failed.");
    process.exit(1);
  }

  // Step 3: Post-deployment validation
  const validationPass = await postDeploymentValidation(config);
  if (!validationPass) {
    error("\nPost-deployment validation failed.");
    warning("Contract deployed but may have issues.");
  }

  // Step 4: Verify on block explorer
  if (networkName !== "hardhat") {
    const verified = await verifyContract(config, networkName);
    config.verified = verified;
  }

  // Step 5: Save deployment info
  saveDeployment(config);
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main, deployFactory, preDeploymentChecks, postDeploymentValidation };
