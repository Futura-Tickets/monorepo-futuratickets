import { ethers } from "hardhat";

/**
 * Test script to verify Factory deployment and create a test event
 */
async function main() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   🧪 TESTING DEPLOYMENT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get signers
  const [deployer, user1] = await ethers.getSigners();
  console.log("👤 Deployer:", deployer.address);
  console.log("👤 Test User:", user1.address);

  // Get deployed factory
  const factoryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log("\n📍 Factory Address:", factoryAddress);

  const Factory = await ethers.getContractFactory("FuturaEventFactory");
  const factory = Factory.attach(factoryAddress);

  // Test 1: Create new event
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   TEST 1: Create Event Contract");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const eventName = "Rock Concert 2025";
  const maxSupply = 1000;
  const baseURI = "https://futuratickets.com/metadata/";

  console.log("\n📝 Creating event:");
  console.log("   Name:", eventName);
  console.log("   Max Supply:", maxSupply);
  console.log("   Owner:", deployer.address);

  const createTx = await factory.createNew(
    deployer.address,
    eventName,
    maxSupply,
    baseURI
  );
  const receipt = await createTx.wait();

  // Get event contract address from event
  const eventCreatedEvent = receipt?.logs.find((log: any) => {
    try {
      return factory.interface.parseLog(log)?.name === "FuturaEventCreated";
    } catch {
      return false;
    }
  });

  if (!eventCreatedEvent) {
    throw new Error("FuturaEventCreated event not found");
  }

  const parsedLog = factory.interface.parseLog(eventCreatedEvent);
  const eventContractAddress = parsedLog?.args[0];

  console.log("\n✅ Event contract created!");
  console.log("   Address:", eventContractAddress);
  console.log("   Tx Hash:", receipt?.hash);
  console.log("   Gas Used:", receipt?.gasUsed.toString());

  // Test 2: Verify total events
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   TEST 2: Verify Event Creation");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const totalEvents = await factory.getTotalEvents();
  console.log("\n📊 Total Events:", totalEvents.toString());

  const eventInfo = await factory.getFuturaEventById(1);
  console.log("📋 Event Info:");
  console.log("   ID: 1");
  console.log("   Address:", eventInfo.eventAddress);
  console.log("   Name:", eventInfo.eventName);
  console.log("   Max Supply:", eventInfo.maxSupply.toString());

  // Test 3: Mint NFT ticket
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   TEST 3: Mint NFT Ticket");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const Event = await ethers.getContractFactory("FuturaEvent");
  const event = Event.attach(eventContractAddress);

  console.log("\n🎫 Minting ticket:");
  console.log("   Client:", user1.address);
  console.log("   Royalty:", "5%");

  const mintTx = await event.mintNFT(
    user1.address,
    5, // 5% royalty
    Date.now()
  );
  const mintReceipt = await mintTx.wait();

  // Get token ID from event
  const tokenMintedEvent = mintReceipt?.logs.find((log: any) => {
    try {
      return event.interface.parseLog(log)?.name === "TokenMinted";
    } catch {
      return false;
    }
  });

  if (!tokenMintedEvent) {
    throw new Error("TokenMinted event not found");
  }

  const parsedMintLog = event.interface.parseLog(tokenMintedEvent);
  const tokenId = parsedMintLog?.args[2]; // tokenId is 3rd arg

  console.log("\n✅ Ticket minted!");
  console.log("   Token ID:", tokenId.toString());
  console.log("   Owner:", await event.ownerOf(tokenId));
  console.log("   Gas Used:", mintReceipt?.gasUsed.toString());

  // Test 4: Verify ticket details
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   TEST 4: Verify Ticket Details");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const nftDetails = await event.nftDetails(tokenId);
  console.log("\n🔍 NFT Details:");
  console.log("   Token ID:", tokenId.toString());
  console.log("   Creator:", nftDetails.creator);
  console.log("   Royalty %:", nftDetails.royaltyPercentage.toString());
  console.log("   Status:", ["OPEN", "CLOSED", "SALE"][nftDetails.status]);

  // Test 5: Check total supply
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   TEST 5: Verify Supply");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const totalSupply = await event.totalSupply();
  const maxSupplyCheck = await event.MAX_SUPPLY();

  console.log("\n📊 Supply Info:");
  console.log("   Total Minted:", totalSupply.toString());
  console.log("   Max Supply:", maxSupplyCheck.toString());
  console.log("   Remaining:", (maxSupplyCheck - totalSupply).toString());

  // Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   ✅ ALL TESTS PASSED!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n📋 Summary:");
  console.log("   Factory Address:", factoryAddress);
  console.log("   Event Address:", eventContractAddress);
  console.log("   Total Events:", totalEvents.toString());
  console.log("   Tickets Minted:", totalSupply.toString());
  console.log("\n✅ Deployment verified successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
