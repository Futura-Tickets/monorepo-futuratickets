const { ethers } = require("ethers");
const fs = require("fs");
require('dotenv').config();  // Ensure your .env file contains PRIVATE_KEY and INFURA_API_KEY

// Load ABI and Bytecode of the contract
const contractABI = JSON.parse(fs.readFileSync('./MarketplaceNFT_ABI.json', 'utf8')); // Contract ABI
const contractBytecode = fs.readFileSync('./MarketplaceNFT_bytecode.txt', 'utf8');    // Contract Bytecode

async function main() {
    // Provider and Wallet setup
    const provider = new ethers.providers.InfuraProvider('base', process.env.INFURA_API_KEY); // Using Sepolia Testnet for example
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Prompt user for metadata
    const readlineSync = require('readline-sync');
    const title = readlineSync.question('Enter the NFT Title: ');
    const description = readlineSync.question('Enter the NFT Description: ');
    const price = readlineSync.questionFloat('Enter the NFT Price in ETH: ');
    const royaltyPercentage = readlineSync.questionInt('Enter the royalty percentage (e.g. 5 for 5%): ');
    const ownerWallet = readlineSync.question('Enter the Deployer/Owner Wallet Address: ');
    const eventOwnerWallet = readlineSync.question('Enter the Event Owner Wallet (for royalties): ');
    const customerWallet = readlineSync.question('Enter the Customer Wallet Address: ');

    // Deploy the MarketplaceNFT contract
    const contractFactory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
    const marketplaceNFT = await contractFactory.deploy();

    console.log(`MarketplaceNFT Contract deployed at: ${marketplaceNFT.address}`);
    await marketplaceNFT.deployed();  // Wait until the contract is deployed

    // Mint an NFT with the provided metadata
    console.log(`Minting an NFT for customer...`);
    const tx = await marketplaceNFT.mintNFT(
        `ipfs://<your-ipfs-hash>`,   // Replace with IPFS URI after uploading metadata
        ethers.utils.parseEther(price.toString()),  // Convert price to wei
        royaltyPercentage
    );

    console.log(`Minting transaction hash: ${tx.hash}`);
    await tx.wait();  // Wait for the transaction to be mined

    console.log('NFT Minted successfully.');
    console.log(`NFT Owner Address: ${ownerWallet}`);
    console.log(`Customer Address: ${customerWallet}`);
}

main().catch((error) => {
    console.error("Error deploying the contract or minting NFT:", error);
    process.exit(1);
});