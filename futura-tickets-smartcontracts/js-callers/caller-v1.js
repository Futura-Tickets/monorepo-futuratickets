import { ethers } from "ethers";

// Contract details
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const abi = [
  // Contract ABI goes here
];

async function mintNFT(signer: ethers.Signer, tokenURI: string, price: number, royaltyPercentage: number) {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.mintNFT(tokenURI, price, royaltyPercentage);
  await tx.wait();
  console.log("NFT Minted:", tx);
}

async function purchaseNFT(signer: ethers.Signer, tokenId: number, value: ethers.BigNumber) {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.purchaseNFT(tokenId, { value });
  await tx.wait();
  console.log("NFT Purchased:", tx);
}

async function resellNFT(signer: ethers.Signer, tokenId: number, resalePrice: number, value: ethers.BigNumber) {
  const contract = new ethers.Contract(contractAddress, abi, signer);
  const tx = await contract.resellNFT(tokenId, resalePrice, { value });
  await tx.wait();
  console.log("NFT Resold:", tx);
}