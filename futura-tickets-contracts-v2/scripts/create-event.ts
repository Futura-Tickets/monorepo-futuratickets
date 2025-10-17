import { ethers } from "hardhat";

/**
 * Script to create a new event contract using the Factory
 * Usage: npx hardhat run scripts/create-event.ts --network baseSepolia
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Creating New Event Contract");
  console.log("=".repeat(60));

  // Get factory address from deployments
  const factoryAddress = process.env.FACTORY_CONTRACT_ADDRESS;
  if (!factoryAddress) {
    throw new Error("FACTORY_CONTRACT_ADDRESS not found in .env");
  }

  // Event parameters (customize these)
  const eventName = "Test Event 2024";
  const maxSupply = 1000; // Max 1000 tickets
  const baseURI = "https://api.futuratickets.com/metadata/"; // Metadata base URI

  const [deployer] = await ethers.getSigners();
  const ownerAddress = deployer.address; // Or specify a different promoter address

  console.log("\nEvent Parameters:");
  console.log("  Name:", eventName);
  console.log("  Owner:", ownerAddress);
  console.log("  Max Supply:", maxSupply);
  console.log("  Base URI:", baseURI);
  console.log("\nFactory Address:", factoryAddress);
  console.log("Deployer:", deployer.address);
  console.log("=".repeat(60));

  // Get factory contract
  const factory = await ethers.getContractAt("FuturaEventFactory", factoryAddress);

  // Create new event
  console.log("\n📡 Sending transaction...");
  const tx = await factory.createNew(ownerAddress, eventName, maxSupply, baseURI);

  console.log("Transaction hash:", tx.hash);
  console.log("⏳ Waiting for confirmation...");

  const receipt = await tx.wait();

  console.log("✅ Transaction confirmed!");
  console.log("Block number:", receipt.blockNumber);

  // Parse event to get new contract address
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed?.name === "FuturaEventCreated";
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = factory.interface.parseLog(event);
    const eventId = parsed?.args[0];
    const contractAddress = parsed?.args[1];

    console.log("\n" + "=".repeat(60));
    console.log("✅ Event Contract Created!");
    console.log("  Event ID:", eventId.toString());
    console.log("  Contract Address:", contractAddress);
    console.log("=".repeat(60));

    console.log("\n📝 Save this to your database:");
    console.log(`  Event { address: "${contractAddress}", blockNumber: ${receipt.blockNumber} }`);
  } else {
    console.log("\n⚠️  Could not parse event. Check transaction on block explorer.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
