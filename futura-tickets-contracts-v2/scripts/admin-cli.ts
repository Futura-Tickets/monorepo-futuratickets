#!/usr/bin/env ts-node

/**
 * 🛠️ FUTURA TICKETS ADMIN CLI
 *
 * Herramienta de línea de comandos para administración de contratos.
 *
 * COMANDOS DISPONIBLES:
 *
 * Status & Info:
 *   - status                    Ver estado general del sistema
 *   - factory:info              Información del Factory contract
 *   - event:info <address>      Información de un evento específico
 *   - event:list                Listar todos los eventos creados
 *
 * Ticket Management:
 *   - ticket:info <address> <tokenId>      Info de un ticket específico
 *   - ticket:status <address> <tokenId>    Estado de un ticket
 *   - ticket:transfer <address> <tokenId> <to>  Transferir ticket
 *
 * Contract Management:
 *   - contract:pause <address>       Pausar contrato
 *   - contract:unpause <address>     Reanudar contrato
 *   - contract:owner <address>       Ver owner del contrato
 *
 * Utilities:
 *   - balance <address>              Ver balance de una dirección
 *   - block                          Ver número de bloque actual
 *   - accounts                       Listar cuentas disponibles
 *
 * EJEMPLOS:
 *
 *   npm run admin status
 *   npm run admin event:list
 *   npm run admin ticket:info 0x123... 1
 *   npm run admin balance 0x123...
 *
 * CONFIGURACIÓN:
 *
 * Variables de entorno necesarias:
 *   - LOCAL_RPC_URL
 *   - FACTORY_CONTRACT_ADDRESS
 *   - DEPLOYER_PRIVATE_KEY_LOCAL (para operaciones que requieren firma)
 */

import { ethers } from "ethers";
import * as dotenv from "dotenv";
import FuturaEventFactoryABI from "../abi/FuturaEventFactory.json";
import FuturaEventABI from "../abi/FuturaEvent.json";
import { NETWORKS, CONTRACT_ADDRESSES, TICKET_STATUS_NAMES } from "../lib/constants";

dotenv.config();

// ==================== CONFIGURACIÓN ====================

const RPC_URL = process.env.LOCAL_RPC_URL || NETWORKS.hardhat.rpcUrl;
const FACTORY_ADDRESS =
  process.env.FACTORY_CONTRACT_ADDRESS ||
  CONTRACT_ADDRESSES.hardhat.factoryAddress;
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY_LOCAL || "";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = PRIVATE_KEY ? new ethers.Wallet(PRIVATE_KEY, provider) : null;

// Colores para CLI
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

// ==================== HELPER FUNCTIONS ====================

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title: string) {
  console.log("");
  log("═".repeat(60), "blue");
  log(`  ${title}`, "bright");
  log("═".repeat(60), "blue");
  console.log("");
}

function section(title: string) {
  log(`\n${title}`, "cyan");
  log("─".repeat(60), "dim");
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

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatEther(wei: bigint): string {
  return ethers.formatEther(wei);
}

// ==================== FACTORY COMMANDS ====================

async function factoryInfo() {
  header("🏭 FACTORY CONTRACT INFO");

  try {
    const factory = new ethers.Contract(
      FACTORY_ADDRESS,
      FuturaEventFactoryABI,
      provider
    );

    log(`📍 Address: ${FACTORY_ADDRESS}`, "bright");

    // Get code to verify deployment
    const code = await provider.getCode(FACTORY_ADDRESS);
    const isDeployed = code !== "0x";

    if (isDeployed) {
      success("Contract is deployed");
    } else {
      error("Contract is NOT deployed");
      return;
    }

    // Get events created
    const filter = factory.filters.FuturaEventCreated();
    const events = await factory.queryFilter(filter, 0, "latest");

    log(`📊 Total events created: ${events.length}`, "bright");

    if (events.length > 0) {
      section("Recently created events:");
      events.slice(-5).forEach((event, index) => {
        if ('args' in event) {
          const args = event.args as any;
          log(
            `  ${index + 1}. ${args.contractAddress} (block ${event.blockNumber})`,
            "dim"
          );
        }
      });
    }

    success("\nFactory info retrieved successfully");
  } catch (err) {
    error(`Failed to get factory info: ${err}`);
    process.exit(1);
  }
}

async function eventList() {
  header("📋 EVENTS LIST");

  try {
    const factory = new ethers.Contract(
      FACTORY_ADDRESS,
      FuturaEventFactoryABI,
      provider
    );

    const filter = factory.filters.FuturaEventCreated();
    const events = await factory.queryFilter(filter, 0, "latest");

    if (events.length === 0) {
      warning("No events found");
      return;
    }

    log(`Found ${events.length} events:\n`, "bright");

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!('args' in event) || !event.args) continue;
      const args = event.args as any;
      const eventAddress = args.contractAddress;

      if (!eventAddress) {
        warning(`Skipping event ${i + 1}: unable to extract address`);
        continue;
      }

      // Get event contract info
      const eventContract = new ethers.Contract(
        eventAddress,
        FuturaEventABI,
        provider
      );

      try {
        const name = await eventContract.name();
        const symbol = await eventContract.symbol();
        const owner = await eventContract.owner();

        // Count tokens minted
        const mintFilter = eventContract.filters.TokenMinted();
        const mintEvents = await eventContract.queryFilter(
          mintFilter,
          0,
          "latest"
        );

        log(`${i + 1}. ${eventAddress}`, "bright");
        log(`   📛 Name: ${name} (${symbol})`, "dim");
        log(`   👤 Owner: ${formatAddress(owner)}`, "dim");
        log(`   🎫 Tickets minted: ${mintEvents.length}`, "dim");
        log(`   🔢 Block: ${event.blockNumber}`, "dim");
        console.log("");
      } catch (err) {
        log(`${i + 1}. ${eventAddress}`, "bright");
        log(`   ⚠️  Unable to fetch details`, "yellow");
        console.log("");
      }
    }

    success("Events list retrieved successfully");
  } catch (err) {
    error(`Failed to get events list: ${err}`);
    process.exit(1);
  }
}

async function eventInfo(address: string) {
  header(`📋 EVENT CONTRACT INFO: ${formatAddress(address)}`);

  try {
    const eventContract = new ethers.Contract(
      address,
      FuturaEventABI,
      provider
    );

    // Basic info
    const name = await eventContract.name();
    const symbol = await eventContract.symbol();
    const owner = await eventContract.owner();

    log(`📍 Address: ${address}`, "bright");
    log(`📛 Name: ${name}`, "bright");
    log(`🏷️  Symbol: ${symbol}`, "bright");
    log(`👤 Owner: ${owner}`, "bright");

    // Get minted tokens
    const mintFilter = eventContract.filters.TokenMinted();
    const mintEvents = await eventContract.queryFilter(mintFilter, 0, "latest");

    log(`🎫 Total tickets minted: ${mintEvents.length}`, "bright");

    if (mintEvents.length > 0) {
      section("Recently minted tickets:");
      mintEvents.slice(-5).forEach((event) => {
        if ('args' in event) {
          const args = event.args as any;
          log(
            `  Token #${args.tokenId}: ${formatAddress(args.client)} (timestamp: ${args.timeStamp})`,
            "dim"
          );
        }
      });
    }

    // Get transfer events
    const transferFilter = eventContract.filters.Transfer();
    const transferEvents = await eventContract.queryFilter(
      transferFilter,
      0,
      "latest"
    );

    // Filter out mint transfers (from 0x0)
    const realTransfers = transferEvents.filter(
      (e) => 'args' in e && (e.args as any).from !== "0x0000000000000000000000000000000000000000"
    );

    log(`📦 Total transfers: ${realTransfers.length}`, "bright");

    success("\nEvent info retrieved successfully");
  } catch (err) {
    error(`Failed to get event info: ${err}`);
    process.exit(1);
  }
}

// ==================== TICKET COMMANDS ====================

async function ticketInfo(eventAddress: string, tokenId: number) {
  header(`🎫 TICKET INFO: #${tokenId}`);

  try {
    const eventContract = new ethers.Contract(
      eventAddress,
      FuturaEventABI,
      provider
    );

    // Get ticket owner
    const owner = await eventContract.ownerOf(tokenId);

    // Get NFT details
    const details = await eventContract.nftDetails(tokenId);

    log(`📍 Event Contract: ${eventAddress}`, "bright");
    log(`🔢 Token ID: ${tokenId}`, "bright");
    log(`👤 Owner: ${owner}`, "bright");
    log(`💰 Price: ${formatEther(details.price)} ETH`, "bright");
    log(`🎨 Creator: ${details.creator}`, "bright");
    log(`💎 Royalty: ${details.royaltyPercentage}%`, "bright");
    log(
      `📊 Status: ${TICKET_STATUS_NAMES[Number(details.status) as 0 | 1 | 2]}`,
      "bright"
    );

    // Get token URI if exists
    try {
      const tokenURI = await eventContract.tokenURI(tokenId);
      log(`🔗 Token URI: ${tokenURI}`, "dim");
    } catch {
      // Token URI might not exist
    }

    success("\nTicket info retrieved successfully");
  } catch (err) {
    error(`Failed to get ticket info: ${err}`);
    process.exit(1);
  }
}

async function ticketStatus(eventAddress: string, tokenId: number) {
  header(`📊 TICKET STATUS: #${tokenId}`);

  try {
    const eventContract = new ethers.Contract(
      eventAddress,
      FuturaEventABI,
      provider
    );

    const details = await eventContract.nftDetails(tokenId);
    const statusName = TICKET_STATUS_NAMES[Number(details.status) as 0 | 1 | 2];

    log(`Status: ${statusName}`, "bright");

    switch (Number(details.status)) {
      case 0: // OPEN
        success("✅ Ticket is OPEN - Ready for use");
        break;
      case 1: // CLOSED
        warning("🔒 Ticket is CLOSED - Already used");
        break;
      case 2: // SALE
        log(
          `💰 Ticket is for SALE - Price: ${formatEther(details.price)} ETH`,
          "yellow"
        );
        break;
    }
  } catch (err) {
    error(`Failed to get ticket status: ${err}`);
    process.exit(1);
  }
}

async function ticketTransfer(
  eventAddress: string,
  tokenId: number,
  toAddress: string
) {
  header(`📦 TRANSFER TICKET: #${tokenId}`);

  if (!wallet) {
    error("Private key not configured. Cannot sign transaction.");
    process.exit(1);
  }

  try {
    const eventContract = new ethers.Contract(
      eventAddress,
      FuturaEventABI,
      wallet
    );

    log(`From: ${wallet.address}`, "dim");
    log(`To: ${toAddress}`, "dim");
    log(`Token ID: ${tokenId}`, "dim");

    warning("\nSending transaction...");

    const tx = await eventContract.transferNFT(tokenId, toAddress);

    log(`Transaction hash: ${tx.hash}`, "dim");
    log("Waiting for confirmation...", "dim");

    const receipt = await tx.wait();

    success(`\nTicket transferred successfully! (block ${receipt.blockNumber})`);
  } catch (err: any) {
    error(`Failed to transfer ticket: ${err.message || err}`);
    process.exit(1);
  }
}

// ==================== CONTRACT MANAGEMENT ====================

async function contractPause(eventAddress: string) {
  header(`⏸️  PAUSE CONTRACT: ${formatAddress(eventAddress)}`);

  if (!wallet) {
    error("Private key not configured. Cannot sign transaction.");
    process.exit(1);
  }

  try {
    const eventContract = new ethers.Contract(
      eventAddress,
      FuturaEventABI,
      wallet
    );

    warning("Sending pause transaction...");

    const tx = await eventContract.pause();
    log(`Transaction hash: ${tx.hash}`, "dim");

    const receipt = await tx.wait();

    success(`\nContract paused successfully! (block ${receipt.blockNumber})`);
  } catch (err: any) {
    error(`Failed to pause contract: ${err.message || err}`);
    process.exit(1);
  }
}

async function contractUnpause(eventAddress: string) {
  header(`▶️  UNPAUSE CONTRACT: ${formatAddress(eventAddress)}`);

  if (!wallet) {
    error("Private key not configured. Cannot sign transaction.");
    process.exit(1);
  }

  try {
    const eventContract = new ethers.Contract(
      eventAddress,
      FuturaEventABI,
      wallet
    );

    warning("Sending unpause transaction...");

    const tx = await eventContract.unpause();
    log(`Transaction hash: ${tx.hash}`, "dim");

    const receipt = await tx.wait();

    success(`\nContract unpaused successfully! (block ${receipt.blockNumber})`);
  } catch (err: any) {
    error(`Failed to unpause contract: ${err.message || err}`);
    process.exit(1);
  }
}

async function contractOwner(eventAddress: string) {
  header(`👤 CONTRACT OWNER: ${formatAddress(eventAddress)}`);

  try {
    const eventContract = new ethers.Contract(
      eventAddress,
      FuturaEventABI,
      provider
    );

    const owner = await eventContract.owner();

    log(`Owner: ${owner}`, "bright");

    if (wallet && wallet.address.toLowerCase() === owner.toLowerCase()) {
      success("✅ You are the owner of this contract");
    } else {
      warning("⚠️  You are NOT the owner of this contract");
    }
  } catch (err) {
    error(`Failed to get contract owner: ${err}`);
    process.exit(1);
  }
}

// ==================== UTILITY COMMANDS ====================

async function systemStatus() {
  header("🔍 SYSTEM STATUS");

  try {
    // Network info
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    section("Network Info:");
    log(`  Chain ID: ${network.chainId}`, "dim");
    log(`  Name: ${network.name}`, "dim");
    log(`  Current block: ${blockNumber}`, "dim");
    log(`  RPC URL: ${RPC_URL}`, "dim");

    // Factory info
    section("Factory Contract:");
    log(`  Address: ${FACTORY_ADDRESS}`, "dim");

    const code = await provider.getCode(FACTORY_ADDRESS);
    const isDeployed = code !== "0x";

    if (isDeployed) {
      success("  Status: Deployed ✅");

      const factory = new ethers.Contract(
        FACTORY_ADDRESS,
        FuturaEventFactoryABI,
        provider
      );
      const filter = factory.filters.FuturaEventCreated();
      const events = await factory.queryFilter(filter, 0, "latest");

      log(`  Events created: ${events.length}`, "dim");
    } else {
      error("  Status: NOT deployed ❌");
    }

    // Wallet info
    if (wallet) {
      section("Admin Wallet:");
      log(`  Address: ${wallet.address}`, "dim");

      const balance = await provider.getBalance(wallet.address);
      log(`  Balance: ${formatEther(balance)} ETH`, "dim");
    } else {
      section("Admin Wallet:");
      warning("  Not configured (no private key)");
    }

    success("\nSystem status retrieved successfully");
  } catch (err) {
    error(`Failed to get system status: ${err}`);
    process.exit(1);
  }
}

async function getBalance(address: string) {
  header(`💰 BALANCE: ${formatAddress(address)}`);

  try {
    const balance = await provider.getBalance(address);

    log(`Address: ${address}`, "bright");
    log(`Balance: ${formatEther(balance)} ETH`, "bright");

    success("\nBalance retrieved successfully");
  } catch (err) {
    error(`Failed to get balance: ${err}`);
    process.exit(1);
  }
}

async function getCurrentBlock() {
  header("🔢 CURRENT BLOCK");

  try {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber);

    log(`Block number: ${blockNumber}`, "bright");
    log(`Timestamp: ${new Date((block?.timestamp ?? 0) * 1000).toISOString()}`, "dim");
    log(`Transactions: ${block?.transactions.length ?? 0}`, "dim");

    success("\nBlock info retrieved successfully");
  } catch (err) {
    error(`Failed to get block info: ${err}`);
    process.exit(1);
  }
}

async function listAccounts() {
  header("👥 AVAILABLE ACCOUNTS");

  try {
    // For Hardhat local network, we can get the test accounts
    const accounts = [
      "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    ];

    for (let i = 0; i < accounts.length; i++) {
      const address = accounts[i];
      const balance = await provider.getBalance(address);

      log(`${i + 1}. ${address}`, "bright");
      log(`   Balance: ${formatEther(balance)} ETH`, "dim");
      console.log("");
    }

    success("Accounts listed successfully");
  } catch (err) {
    error(`Failed to list accounts: ${err}`);
    process.exit(1);
  }
}

// ==================== CLI ROUTER ====================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help") {
    header("🛠️ FUTURA TICKETS ADMIN CLI");

    console.log("USAGE:");
    console.log("  npm run admin <command> [args]\n");

    console.log("COMMANDS:\n");

    console.log("Status & Info:");
    console.log("  status                              System status");
    console.log("  factory:info                        Factory contract info");
    console.log("  event:info <address>                Event contract info");
    console.log("  event:list                          List all events\n");

    console.log("Ticket Management:");
    console.log(
      "  ticket:info <address> <tokenId>     Ticket details"
    );
    console.log(
      "  ticket:status <address> <tokenId>   Ticket status"
    );
    console.log(
      "  ticket:transfer <address> <tokenId> <to>  Transfer ticket\n"
    );

    console.log("Contract Management:");
    console.log("  contract:pause <address>            Pause contract");
    console.log("  contract:unpause <address>          Unpause contract");
    console.log("  contract:owner <address>            Get contract owner\n");

    console.log("Utilities:");
    console.log("  balance <address>                   Get balance");
    console.log("  block                               Current block");
    console.log("  accounts                            List accounts\n");

    console.log("EXAMPLES:");
    console.log("  npm run admin status");
    console.log("  npm run admin event:list");
    console.log("  npm run admin ticket:info 0x123... 1");
    console.log("  npm run admin balance 0x123...");

    return;
  }

  try {
    switch (command) {
      // Status & Info
      case "status":
        await systemStatus();
        break;
      case "factory:info":
        await factoryInfo();
        break;
      case "event:info":
        if (!args[1]) throw new Error("Missing event address");
        await eventInfo(args[1]);
        break;
      case "event:list":
        await eventList();
        break;

      // Ticket Management
      case "ticket:info":
        if (!args[1] || !args[2])
          throw new Error("Missing address or tokenId");
        await ticketInfo(args[1], parseInt(args[2]));
        break;
      case "ticket:status":
        if (!args[1] || !args[2])
          throw new Error("Missing address or tokenId");
        await ticketStatus(args[1], parseInt(args[2]));
        break;
      case "ticket:transfer":
        if (!args[1] || !args[2] || !args[3])
          throw new Error("Missing address, tokenId or destination");
        await ticketTransfer(args[1], parseInt(args[2]), args[3]);
        break;

      // Contract Management
      case "contract:pause":
        if (!args[1]) throw new Error("Missing contract address");
        await contractPause(args[1]);
        break;
      case "contract:unpause":
        if (!args[1]) throw new Error("Missing contract address");
        await contractUnpause(args[1]);
        break;
      case "contract:owner":
        if (!args[1]) throw new Error("Missing contract address");
        await contractOwner(args[1]);
        break;

      // Utilities
      case "balance":
        if (!args[1]) throw new Error("Missing address");
        await getBalance(args[1]);
        break;
      case "block":
        await getCurrentBlock();
        break;
      case "accounts":
        await listAccounts();
        break;

      default:
        error(`Unknown command: ${command}`);
        log("Run 'npm run admin help' for usage info", "dim");
        process.exit(1);
    }
  } catch (err: any) {
    error(`\n${err.message || err}`);
    process.exit(1);
  }
}

// Run CLI
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
