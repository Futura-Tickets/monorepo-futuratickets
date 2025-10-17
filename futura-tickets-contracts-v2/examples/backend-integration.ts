/**
 * 🔗 BACKEND INTEGRATION EXAMPLE
 *
 * This file shows how to interact with FuturaTickets smart contracts
 * from your backend (futura-tickets-rest-api, admin-api, etc.)
 */

import { ethers } from "ethers";
import FuturaEventFactoryABI from "../abi/FuturaEventFactory.json";
import FuturaEventABI from "../abi/FuturaEvent.json";

// ============================================
// 1. CONFIGURATION
// ============================================

const config = {
  rpcUrl: process.env.LOCAL_RPC_URL || "http://127.0.0.1:8545",
  factoryAddress: process.env.FACTORY_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY_LOCAL || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
};

// ============================================
// 2. SETUP PROVIDER & SIGNER
// ============================================

const provider = new ethers.JsonRpcProvider(config.rpcUrl);
const wallet = new ethers.Wallet(config.deployerPrivateKey, provider);

console.log("🔗 Connected to:", config.rpcUrl);
console.log("👤 Wallet address:", wallet.address);

// ============================================
// 3. CONTRACT INSTANCES
// ============================================

const factoryContract = new ethers.Contract(
  config.factoryAddress,
  FuturaEventFactoryABI,
  wallet
);

// ============================================
// 4. EXAMPLE FUNCTIONS
// ============================================

/**
 * Create a new event contract
 */
async function createEvent(
  promoterAddress: string,
  eventName: string,
  maxSupply: number,
  baseURI: string
) {
  console.log("\n📝 Creating new event...");
  console.log("  Name:", eventName);
  console.log("  Max Supply:", maxSupply);
  console.log("  Owner:", promoterAddress);

  const tx = await factoryContract.createNew(
    promoterAddress,
    eventName,
    maxSupply,
    baseURI
  );

  console.log("⏳ Transaction sent:", tx.hash);

  const receipt = await tx.wait();

  // Get event from logs
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = factoryContract.interface.parseLog(log);
      return parsed?.name === "FuturaEventCreated";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("Event creation failed - no event found in logs");
  }

  const parsedEvent = factoryContract.interface.parseLog(event);
  if (!parsedEvent) throw new Error("Failed to parse event");
  const eventId = parsedEvent.args.eventId;
  const contractAddress = parsedEvent.args.contractAddress;

  console.log("✅ Event created!");
  console.log("  Event ID:", eventId.toString());
  console.log("  Contract Address:", contractAddress);
  console.log("  Gas Used:", receipt.gasUsed.toString());

  return {
    eventId: eventId.toString(),
    contractAddress,
    transactionHash: receipt.hash,
    gasUsed: receipt.gasUsed.toString(),
  };
}

/**
 * Mint a ticket NFT
 */
async function mintTicket(
  eventContractAddress: string,
  clientAddress: string,
  price: string, // in ETH
  royaltyPercentage: number
) {
  console.log("\n🎫 Minting ticket...");
  console.log("  Event Contract:", eventContractAddress);
  console.log("  Client:", clientAddress);
  console.log("  Price:", price, "ETH");
  console.log("  Royalty:", royaltyPercentage + "%");

  const eventContract = new ethers.Contract(
    eventContractAddress,
    FuturaEventABI,
    wallet
  );

  const priceWei = ethers.parseEther(price);
  const timestamp = Math.floor(Date.now() / 1000);

  const tx = await eventContract.mintNFT(
    priceWei,
    clientAddress,
    royaltyPercentage,
    timestamp,
    0 // TicketStatus.OPEN
  );

  console.log("⏳ Transaction sent:", tx.hash);

  const receipt = await tx.wait();

  // Get tokenId from logs
  const mintEvent = receipt.logs.find((log: any) => {
    try {
      const parsed = eventContract.interface.parseLog(log);
      return parsed?.name === "TokenMinted";
    } catch {
      return false;
    }
  });

  if (!mintEvent) {
    throw new Error("Minting failed - no event found in logs");
  }

  const parsedMintEvent = eventContract.interface.parseLog(mintEvent);
  if (!parsedMintEvent) throw new Error("Failed to parse mint event");
  const tokenId = parsedMintEvent.args.tokenId;

  console.log("✅ Ticket minted!");
  console.log("  Token ID:", tokenId.toString());
  console.log("  Gas Used:", receipt.gasUsed.toString());

  return {
    tokenId: tokenId.toString(),
    transactionHash: receipt.hash,
    gasUsed: receipt.gasUsed.toString(),
  };
}

/**
 * Check ticket status
 */
async function getTicketDetails(
  eventContractAddress: string,
  tokenId: number
) {
  console.log("\n🔍 Getting ticket details...");

  const eventContract = new ethers.Contract(
    eventContractAddress,
    FuturaEventABI,
    provider // Read-only, no signer needed
  );

  const details = await eventContract.getTicketDetails(tokenId);
  const owner = await eventContract.ownerOf(tokenId);

  console.log("📋 Ticket Details:");
  console.log("  Token ID:", tokenId);
  console.log("  Owner:", owner);
  console.log("  Price:", ethers.formatEther(details.price), "ETH");
  console.log("  Creator:", details.creator);
  console.log("  Royalty:", details.royaltyPercentage.toString() + "%");
  console.log("  Status:", ["OPEN", "CLOSED", "SALE"][details.status]);

  return {
    tokenId,
    owner,
    price: ethers.formatEther(details.price),
    creator: details.creator,
    royaltyPercentage: details.royaltyPercentage.toString(),
    status: ["OPEN", "CLOSED", "SALE"][details.status],
  };
}

/**
 * Set ticket status (for check-in)
 */
async function checkInTicket(
  eventContractAddress: string,
  tokenId: number
) {
  console.log("\n🎟️ Checking in ticket...");

  const eventContract = new ethers.Contract(
    eventContractAddress,
    FuturaEventABI,
    wallet
  );

  const tx = await eventContract.setTicketStatus(1, tokenId); // 1 = CLOSED
  const receipt = await tx.wait();

  console.log("✅ Ticket checked in!");
  console.log("  Token ID:", tokenId);
  console.log("  Status: CLOSED");

  return {
    tokenId,
    status: "CLOSED",
    transactionHash: receipt.hash,
  };
}

// ============================================
// 5. EXAMPLE USAGE
// ============================================

async function main() {
  try {
    // Example 1: Create an event
    const event = await createEvent(
      wallet.address,
      "Rock Concert 2025",
      1000,
      "https://api.futuratickets.com/metadata/"
    );

    // Example 2: Mint a ticket
    const ticket = await mintTicket(
      event.contractAddress,
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Client address
      "0.05", // 0.05 ETH
      5 // 5% royalty
    );

    // Example 3: Get ticket details
    await getTicketDetails(event.contractAddress, parseInt(ticket.tokenId));

    // Example 4: Check-in ticket (mark as CLOSED)
    // await checkInTicket(event.contractAddress, parseInt(ticket.tokenId));

    console.log("\n✅ All examples completed successfully!");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

// Export functions for use in backend
export {
  createEvent,
  mintTicket,
  getTicketDetails,
  checkInTicket,
  factoryContract,
  provider,
  wallet,
};
