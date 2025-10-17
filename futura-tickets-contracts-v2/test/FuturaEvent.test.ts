import { expect } from "chai";
import { ethers } from "hardhat";
import { FuturaEvent, FuturaEventFactory } from "../typechain";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("FuturaEvent", function () {
  let factory: FuturaEventFactory;
  let event: FuturaEvent;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const EVENT_NAME = "Test Concert 2024";
  const MAX_SUPPLY = 100;
  const BASE_URI = "https://api.test.com/metadata/";
  const TICKET_PRICE = ethers.parseEther("0.1");
  const ROYALTY_PERCENTAGE = 5;

  async function deployContractsFixture() {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy Factory
    const Factory = await ethers.getContractFactory("FuturaEventFactory");
    factory = await Factory.deploy();
    await factory.waitForDeployment();

    // Create Event via Factory
    const tx = await factory.createNew(owner.address, EVENT_NAME, MAX_SUPPLY, BASE_URI);
    const receipt = await tx.wait();

    // Get event contract address
    const eventLog = receipt?.logs.find((log: any) => {
      try {
        const parsed = factory.interface.parseLog(log);
        return parsed?.name === "FuturaEventCreated";
      } catch {
        return false;
      }
    });

    const parsed = factory.interface.parseLog(eventLog!);
    const eventAddress = parsed?.args[1];

    // Get event contract instance
    event = await ethers.getContractAt("FuturaEvent", eventAddress);

    return { factory, event, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should deploy factory successfully", async function () {
      const { factory } = await loadFixture(deployContractsFixture);
      expect(await factory.getAddress()).to.be.properAddress;
    });

    it("Should create event with correct parameters", async function () {
      const { event } = await loadFixture(deployContractsFixture);
      expect(await event.name()).to.equal(EVENT_NAME);
      expect(await event.symbol()).to.equal("TKT");
      expect(await event.maxSupply()).to.equal(MAX_SUPPLY);
    });

    it("Should set owner correctly", async function () {
      const { event, owner } = await loadFixture(deployContractsFixture);
      expect(await event.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT successfully", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await expect(
        event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0)
      )
        .to.emit(event, "TokenMinted")
        .withArgs(user1.address, timestamp, 1);

      expect(await event.ownerOf(1)).to.equal(user1.address);
      expect(await event.totalSupply()).to.equal(1);
    });

    it("Should reject minting when max supply reached", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      // Mint MAX_SUPPLY tickets
      const timestamp = Math.floor(Date.now() / 1000);
      for (let i = 0; i < MAX_SUPPLY; i++) {
        await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);
      }

      // Try to mint one more
      await expect(
        event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0)
      ).to.be.revertedWithCustomError(event, "MaxSupplyExceeded");
    });

    it("Should only allow owner to mint", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await expect(
        event.connect(user1).mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0)
      ).to.be.reverted;
    });

    it("Should reject invalid royalty percentage", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await expect(
        event.mintNFT(TICKET_PRICE, user1.address, 101, timestamp, 0)
      ).to.be.revertedWithCustomError(event, "RoyaltyPercentageTooHigh");
    });
  });

  describe("Resale", function () {
    it("Should set ticket price for resale", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      // Mint ticket
      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);

      // Set resale price
      const resalePrice = ethers.parseEther("0.15");
      await expect(event.connect(user1).setNFTPrice(1, resalePrice))
        .to.emit(event, "TokenPriced")
        .withArgs(1, resalePrice, 2); // 2 = SALE status

      const details = await event.getTicketDetails(1);
      expect(details.price).to.equal(resalePrice);
      expect(details.status).to.equal(2); // SALE
    });

    it("Should cancel resale correctly", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      // Mint and set for resale
      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);
      await event.connect(user1).setNFTPrice(1, ethers.parseEther("0.15"));

      // Cancel resale
      await expect(event.connect(user1).cancelResale(1))
        .to.emit(event, "ResaleCancelled")
        .withArgs(1);

      const details = await event.getTicketDetails(1);
      expect(details.status).to.equal(0); // OPEN
      expect(details.price).to.equal(0);
      expect(details.creator).to.not.equal(ethers.ZeroAddress); // Creator info preserved
    });

    it("Should only allow owner to set price", async function () {
      const { event, user1, user2 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);

      await expect(
        event.connect(user2).setNFTPrice(1, ethers.parseEther("0.15"))
      ).to.be.revertedWithCustomError(event, "NotTokenOwner");
    });
  });

  describe("Transfer", function () {
    it("Should transfer ticket correctly", async function () {
      const { event, user1, user2 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);

      await event.connect(user1).transferNFT(1, user2.address);

      expect(await event.ownerOf(1)).to.equal(user2.address);
    });

    it("Should reject transfer to zero address", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);

      await expect(
        event.connect(user1).transferNFT(1, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(event, "InvalidRecipientAddress");
    });
  });

  describe("Ticket Status", function () {
    it("Should set ticket status correctly", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);

      await expect(event.connect(user1).setTicketStatus(1, 1)) // CLOSED
        .to.emit(event, "TokenStatusChanged")
        .withArgs(1, 0, 1); // OPEN -> CLOSED

      const details = await event.getTicketDetails(1);
      expect(details.status).to.equal(1); // CLOSED
    });

    it("Should not allow changing closed ticket status", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);

      // Close ticket
      await event.connect(user1).setTicketStatus(1, 1);

      // Try to change status
      await expect(
        event.connect(user1).setTicketStatus(0, 1)
      ).to.be.revertedWithCustomError(event, "TicketAlreadyClosed");
    });
  });

  describe("Pause/Unpause", function () {
    it("Should pause contract", async function () {
      const { event } = await loadFixture(deployContractsFixture);

      await event.pause();

      const timestamp = Math.floor(Date.now() / 1000);
      await expect(
        event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0)
      ).to.be.reverted;
    });

    it("Should unpause contract", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      await event.pause();
      await event.unpause();

      const timestamp = Math.floor(Date.now() / 1000);
      await expect(
        event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0)
      ).to.not.be.reverted;
    });

    it("Should only allow owner to pause", async function () {
      const { event, user1 } = await loadFixture(deployContractsFixture);

      await expect(event.connect(user1).pause()).to.be.reverted;
    });
  });

  describe("ERC2981 Royalties", function () {
    it("Should set royalty info correctly", async function () {
      const { event, owner, user1 } = await loadFixture(deployContractsFixture);

      const timestamp = Math.floor(Date.now() / 1000);
      await event.mintNFT(TICKET_PRICE, user1.address, ROYALTY_PERCENTAGE, timestamp, 0);

      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await event.royaltyInfo(1, salePrice);

      expect(receiver).to.equal(owner.address);
      expect(royaltyAmount).to.equal(salePrice * BigInt(ROYALTY_PERCENTAGE) / 100n);
    });
  });
});
