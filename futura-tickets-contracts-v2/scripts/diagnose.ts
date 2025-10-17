#!/usr/bin/env ts-node

/**
 * 🔧 BLOCKCHAIN DIAGNOSTICS TOOL
 *
 * Herramienta para diagnosticar problemas comunes en el entorno blockchain.
 *
 * Checks realizados:
 * - ✅ Node.js version
 * - ✅ NPM packages instalados
 * - ✅ Contratos compilados
 * - ✅ ABIs exportados
 * - ✅ Nodo blockchain corriendo
 * - ✅ Contratos desplegados
 * - ✅ Variables de entorno
 * - ✅ ABIs sincronizados con backends
 * - ✅ Conectividad RPC
 * - ✅ Balance del deployer
 *
 * Usage:
 *   npm run diagnose
 *   npm run diagnose -- --fix  (intenta arreglar problemas automáticamente)
 */

import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as dotenv from "dotenv";

dotenv.config();

// ==================== TYPES ====================

interface DiagnosticResult {
  name: string;
  passed: boolean;
  message: string;
  fix?: string;
  critical?: boolean;
}

// ==================== CONFIGURATION ====================

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const RPC_URL = process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545";
const FACTORY_ADDRESS =
  process.env.FACTORY_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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

// ==================== DIAGNOSTIC CHECKS ====================

async function checkNodeVersion(): Promise<DiagnosticResult> {
  try {
    const version = process.version;
    const major = parseInt(version.split(".")[0].replace("v", ""));

    if (major >= 18) {
      return {
        name: "Node.js Version",
        passed: true,
        message: `Node.js ${version} (✓ >= v18 required)`,
      };
    } else {
      return {
        name: "Node.js Version",
        passed: false,
        message: `Node.js ${version} (need >= v18)`,
        fix: "Install Node.js v18 or higher: https://nodejs.org/",
        critical: true,
      };
    }
  } catch (err) {
    return {
      name: "Node.js Version",
      passed: false,
      message: `Failed to check Node.js version: ${err}`,
      critical: true,
    };
  }
}

async function checkNpmPackages(): Promise<DiagnosticResult> {
  try {
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      return {
        name: "NPM Packages",
        passed: false,
        message: "package.json not found",
        critical: true,
      };
    }

    const nodeModulesPath = path.join(__dirname, "..", "node_modules");
    if (!fs.existsSync(nodeModulesPath)) {
      return {
        name: "NPM Packages",
        passed: false,
        message: "node_modules not found",
        fix: "Run: npm install --legacy-peer-deps",
        critical: true,
      };
    }

    // Check key packages
    const requiredPackages = [
      "hardhat",
      "ethers",
      "@openzeppelin/contracts",
    ];
    const missingPackages: string[] = [];

    for (const pkg of requiredPackages) {
      const pkgPath = path.join(nodeModulesPath, pkg);
      if (!fs.existsSync(pkgPath)) {
        missingPackages.push(pkg);
      }
    }

    if (missingPackages.length > 0) {
      return {
        name: "NPM Packages",
        passed: false,
        message: `Missing packages: ${missingPackages.join(", ")}`,
        fix: "Run: npm install --legacy-peer-deps",
        critical: true,
      };
    }

    return {
      name: "NPM Packages",
      passed: true,
      message: "All required packages installed",
    };
  } catch (err) {
    return {
      name: "NPM Packages",
      passed: false,
      message: `Failed to check packages: ${err}`,
      critical: true,
    };
  }
}

async function checkContractsCompiled(): Promise<DiagnosticResult> {
  try {
    const artifactsPath = path.join(__dirname, "..", "artifacts");
    if (!fs.existsSync(artifactsPath)) {
      return {
        name: "Contracts Compiled",
        passed: false,
        message: "Artifacts directory not found",
        fix: "Run: npm run compile",
        critical: true,
      };
    }

    const factoryArtifact = path.join(
      artifactsPath,
      "contracts",
      "FuturaEventFactory.sol",
      "FuturaEventFactory.json"
    );

    const eventArtifact = path.join(
      artifactsPath,
      "contracts",
      "FuturaEvent.sol",
      "FuturaEvent.json"
    );

    if (!fs.existsSync(factoryArtifact) || !fs.existsSync(eventArtifact)) {
      return {
        name: "Contracts Compiled",
        passed: false,
        message: "Contract artifacts not found",
        fix: "Run: npm run compile",
        critical: true,
      };
    }

    return {
      name: "Contracts Compiled",
      passed: true,
      message: "Contracts compiled successfully",
    };
  } catch (err) {
    return {
      name: "Contracts Compiled",
      passed: false,
      message: `Failed to check compilation: ${err}`,
      critical: true,
    };
  }
}

async function checkABIsExported(): Promise<DiagnosticResult> {
  try {
    const abiPath = path.join(__dirname, "..", "abi");
    if (!fs.existsSync(abiPath)) {
      return {
        name: "ABIs Exported",
        passed: false,
        message: "ABI directory not found",
        fix: "Run: npm run export-abis",
      };
    }

    const factoryABI = path.join(abiPath, "FuturaEventFactory.json");
    const eventABI = path.join(abiPath, "FuturaEvent.json");

    if (!fs.existsSync(factoryABI) || !fs.existsSync(eventABI)) {
      return {
        name: "ABIs Exported",
        passed: false,
        message: "ABIs not exported",
        fix: "Run: npm run export-abis",
      };
    }

    return {
      name: "ABIs Exported",
      passed: true,
      message: "ABIs exported successfully",
    };
  } catch (err) {
    return {
      name: "ABIs Exported",
      passed: false,
      message: `Failed to check ABIs: ${err}`,
    };
  }
}

async function checkBlockchainNode(): Promise<DiagnosticResult> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const blockNumber = await provider.getBlockNumber();

    return {
      name: "Blockchain Node",
      passed: true,
      message: `Node running at ${RPC_URL} (block ${blockNumber})`,
    };
  } catch (err) {
    return {
      name: "Blockchain Node",
      passed: false,
      message: `Node not reachable at ${RPC_URL}`,
      fix: "Run: npm run setup (or ./start-blockchain.sh)",
      critical: true,
    };
  }
}

async function checkFactoryDeployed(): Promise<DiagnosticResult> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const code = await provider.getCode(FACTORY_ADDRESS);

    if (code === "0x") {
      return {
        name: "Factory Deployed",
        passed: false,
        message: `Factory not deployed at ${FACTORY_ADDRESS}`,
        fix: "Run: npm run deploy",
      };
    }

    return {
      name: "Factory Deployed",
      passed: true,
      message: `Factory deployed at ${FACTORY_ADDRESS}`,
    };
  } catch (err) {
    return {
      name: "Factory Deployed",
      passed: false,
      message: `Failed to check deployment: ${err}`,
    };
  }
}

async function checkEnvironmentVariables(): Promise<DiagnosticResult> {
  const requiredVars = [
    "LOCAL_RPC_URL",
    "FACTORY_CONTRACT_ADDRESS",
    "DEPLOYER_PRIVATE_KEY_LOCAL",
  ];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    return {
      name: "Environment Variables",
      passed: false,
      message: `Missing variables: ${missingVars.join(", ")}`,
      fix: "Check .env.example and create .env file with required variables",
    };
  }

  return {
    name: "Environment Variables",
    passed: true,
    message: "All required environment variables set",
  };
}

async function checkABIsSynced(): Promise<DiagnosticResult> {
  const backends = [
    "../futura-tickets-admin-api",
    "../futura-tickets-rest-api",
    "../futura-market-place-api",
    "../futura-access-api",
  ];

  const syncedBackends: string[] = [];
  const unsyncedBackends: string[] = [];

  for (const backend of backends) {
    const backendABIPath = path.join(
      __dirname,
      "..",
      backend,
      "src",
      "abis",
      "FuturaEventFactory.json"
    );

    if (fs.existsSync(backendABIPath)) {
      syncedBackends.push(backend.replace("../", ""));
    } else {
      unsyncedBackends.push(backend.replace("../", ""));
    }
  }

  if (unsyncedBackends.length === backends.length) {
    return {
      name: "ABIs Synced",
      passed: false,
      message: "ABIs not synced to any backends",
      fix: "Run: npm run sync-abis",
    };
  }

  if (unsyncedBackends.length > 0) {
    return {
      name: "ABIs Synced",
      passed: false,
      message: `ABIs not synced to: ${unsyncedBackends.join(", ")}`,
      fix: "Run: npm run sync-abis",
    };
  }

  return {
    name: "ABIs Synced",
    passed: true,
    message: `ABIs synced to ${syncedBackends.length} backends`,
  };
}

async function checkDeployerBalance(): Promise<DiagnosticResult> {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const deployerAddress =
      process.env.DEPLOYER_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

    const balance = await provider.getBalance(deployerAddress);
    const balanceEth = parseFloat(ethers.formatEther(balance));

    if (balanceEth < 1) {
      return {
        name: "Deployer Balance",
        passed: false,
        message: `Low balance: ${balanceEth.toFixed(4)} ETH`,
        fix: "Fund the deployer address with test ETH",
      };
    }

    return {
      name: "Deployer Balance",
      passed: true,
      message: `Balance: ${balanceEth.toFixed(4)} ETH`,
    };
  } catch (err) {
    return {
      name: "Deployer Balance",
      passed: false,
      message: `Failed to check balance: ${err}`,
    };
  }
}

// ==================== MAIN DIAGNOSTIC ====================

async function runDiagnostics() {
  header("🔧 BLOCKCHAIN ENVIRONMENT DIAGNOSTICS");

  const results: DiagnosticResult[] = [];

  // Run all checks
  section("Running diagnostic checks...");

  results.push(await checkNodeVersion());
  results.push(await checkNpmPackages());
  results.push(await checkContractsCompiled());
  results.push(await checkABIsExported());
  results.push(await checkBlockchainNode());
  results.push(await checkFactoryDeployed());
  results.push(await checkEnvironmentVariables());
  results.push(await checkABIsSynced());
  results.push(await checkDeployerBalance());

  // Display results
  console.log("");
  section("Diagnostic Results:");

  let passedCount = 0;
  let failedCount = 0;
  let criticalFailed = 0;

  for (const result of results) {
    const icon = result.passed ? "✅" : "❌";
    const color = result.passed ? "green" : "red";

    log(`${icon} ${result.name}`, color);
    log(`   ${result.message}`, color);

    if (!result.passed && result.fix) {
      log(`   Fix: ${result.fix}`, "yellow");
    }

    if (!result.passed && result.critical) {
      criticalFailed++;
    }

    if (result.passed) {
      passedCount++;
    } else {
      failedCount++;
    }

    console.log("");
  }

  // Summary
  section("Summary:");

  log(`✅ Passed: ${passedCount}/${results.length}`, "green");
  log(`❌ Failed: ${failedCount}/${results.length}`, failedCount > 0 ? "red" : "green");

  if (criticalFailed > 0) {
    log(`⚠️  Critical failures: ${criticalFailed}`, "red");
  }

  console.log("");

  // Overall status
  if (failedCount === 0) {
    header("🎉 ALL CHECKS PASSED! Environment is ready.");
  } else if (criticalFailed > 0) {
    header(
      "❌ CRITICAL ISSUES DETECTED! Fix critical issues before proceeding."
    );
    process.exit(1);
  } else {
    header(
      "⚠️  WARNINGS DETECTED. Environment functional but some features may not work."
    );
  }

  // Quick fixes
  if (failedCount > 0) {
    section("Quick Fix Commands:");

    for (const result of results) {
      if (!result.passed && result.fix) {
        log(`• ${result.fix}`, "yellow");
      }
    }

    console.log("");
  }
}

// ==================== MAIN ====================

async function main() {
  await runDiagnostics();
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { main, runDiagnostics };
