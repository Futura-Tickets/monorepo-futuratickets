// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MarketplaceNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Struct to hold NFT details
    struct NFTDetail {
        uint256 price;
        address creator;
        uint256 royaltyPercentage;
    }

    // Mapping token ID to its details
    mapping(uint256 => NFTDetail) public nftDetails;

    constructor() ERC721("MarketplaceNFT", "MKTNFT") {}

    // Mint an NFT
    function mintNFT(
        string memory tokenURI,
        uint256 price,
        uint256 royaltyPercentage
    ) public onlyOwner returns (uint256) {
        require(royaltyPercentage <= 100, "Royalty percentage too high");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId); // Mint the NFT to the deployer
        _setTokenURI(newTokenId, tokenURI);

        // Store NFT details
        nftDetails[newTokenId] = NFTDetail({
            price: price,
            creator: msg.sender,
            royaltyPercentage: royaltyPercentage
        });

        return newTokenId;
    }

    // Purchase the NFT
    function purchaseNFT(uint256 tokenId) public payable {
        NFTDetail memory nft = nftDetails[tokenId];
        require(msg.value == nft.price, "Incorrect price");

        address seller = ownerOf(tokenId);
        _transfer(seller, msg.sender, tokenId); // Transfer NFT to buyer
        payable(seller).transfer(msg.value); // Transfer the payment to the seller
    }

    // Resell the NFT with royalty to the original creator
    function resellNFT(uint256 tokenId, uint256 resalePrice) public payable {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        NFTDetail memory nft = nftDetails[tokenId];

        require(msg.value == resalePrice, "Incorrect resale price");

        // Calculate royalty and send to original creator
        uint256 royalty = (resalePrice * nft.royaltyPercentage) / 100;
        uint256 remainingAmount = resalePrice - royalty;

        payable(nft.creator).transfer(royalty); // Pay royalty to the creator
        payable(msg.sender).transfer(remainingAmount); // Pay the remaining to the seller

        // Transfer NFT to the buyer
        _transfer(msg.sender, tx.origin, tokenId);
    }
}