// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title FuturaEvent
 * @dev NFT ticket system with resale market, royalties, and access control
 * @notice Secure implementation with ReentrancyGuard, Pausable, and ERC2981 royalties
 */
contract FuturaEvent is ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard, Pausable {

    // ==================== CUSTOM ERRORS ====================

    /// @notice Thrown when max supply is 0 or invalid
    error InvalidMaxSupply();

    /// @notice Thrown when client address is zero
    error InvalidClientAddress();

    /// @notice Thrown when royalty percentage exceeds 100%
    error RoyaltyPercentageTooHigh();

    /// @notice Thrown when max supply has been exceeded
    error MaxSupplyExceeded();

    /// @notice Thrown when caller is not the token owner
    error NotTokenOwner();

    /// @notice Thrown when price is set to zero
    error PriceMustBeGreaterThanZero();

    /// @notice Thrown when recipient address is zero
    error InvalidRecipientAddress();

    /// @notice Thrown when ticket is already closed
    error TicketAlreadyClosed();

    /// @notice Thrown when state transition is invalid
    error InvalidStateTransition();

    /// @notice Thrown when token does not exist
    error TokenDoesNotExist();

    /// @notice Thrown when ticket is not for sale
    error TicketNotForSale();

    /// @notice Thrown when arrays have mismatched lengths
    error ArrayLengthMismatch();

    /// @notice Thrown when arrays are empty
    error EmptyArrays();

    /// @notice Thrown when batch mint would exceed max supply
    error WouldExceedMaxSupply();

    // ==================== STATE VARIABLES ====================

    uint256 private _tokenIdCounter;

    /// @notice Maximum supply of tickets for this event
    uint256 public immutable MAX_SUPPLY;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    enum TicketStatus { OPEN, CLOSED, SALE }

    struct NFTDetail {
        uint256 price;              // Current price (for resale)
        address creator;            // Original creator (promoter)
        uint256 royaltyPercentage;  // 0-100 (basis points: 500 = 5%)
        TicketStatus status;        // Current ticket status
    }

    /// @notice Mapping from token ID to ticket details
    mapping(uint256 => NFTDetail) public nftDetails;

    // Events
    event TokenMinted(address indexed client, uint256 indexed timeStamp, uint256 indexed tokenId);
    event TokenPriced(uint256 indexed tokenId, uint256 indexed price, TicketStatus indexed status);
    event TokenStatusChanged(uint256 indexed tokenId, TicketStatus indexed oldStatus, TicketStatus indexed newStatus);
    event ResaleCancelled(uint256 indexed tokenId);
    event MaxSupplyReached(uint256 totalSupply);

    /**
     * @dev Constructor
     * @param owner Address of the contract owner (promoter)
     * @param eventName Name of the event (used as NFT name)
     * @param _maxSupply Maximum number of tickets that can be minted
     * @param baseURI Base URI for token metadata
     */
    constructor(
        address owner,
        string memory eventName,
        uint256 _maxSupply,
        string memory baseURI
    ) Ownable(owner) ERC721(eventName, "TKT") {
        if (_maxSupply == 0) revert InvalidMaxSupply();
        MAX_SUPPLY = _maxSupply;
        _baseTokenURI = baseURI;
    }

    /**
     * @notice Mint a new ticket NFT
     * @dev Only callable by contract owner (promoter)
     * @param price Initial ticket price
     * @param client Address of the ticket buyer
     * @param royaltyPercentage Royalty percentage (0-100)
     * @param timeStamp Timestamp of purchase
     * @param status Initial ticket status
     */
    function mintNFT(
        uint256 price,
        address client,
        uint256 royaltyPercentage,
        uint256 timeStamp,
        TicketStatus status
    ) public onlyOwner whenNotPaused nonReentrant returns (uint256) {
        if (client == address(0)) revert InvalidClientAddress();
        if (royaltyPercentage > 100) revert RoyaltyPercentageTooHigh();
        if (_tokenIdCounter >= MAX_SUPPLY) revert MaxSupplyExceeded();

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(client, newTokenId);

        // Store NFT details
        nftDetails[newTokenId] = NFTDetail({
            price: price,
            creator: msg.sender,
            royaltyPercentage: royaltyPercentage,
            status: status
        });

        // Set royalty info (ERC2981)
        _setTokenRoyalty(newTokenId, msg.sender, uint96(royaltyPercentage * 100)); // Convert to basis points

        emit TokenMinted(client, timeStamp, newTokenId);

        if (_tokenIdCounter == MAX_SUPPLY) {
            emit MaxSupplyReached(MAX_SUPPLY);
        }

        return newTokenId;
    }

    /**
     * @notice Batch mint multiple tickets (gas optimized)
     * @dev Only callable by contract owner
     * @param prices Array of ticket prices
     * @param clients Array of client addresses
     * @param royaltyPercentage Royalty percentage (same for all)
     * @param timeStamp Timestamp of purchase
     * @param status Initial status for all tickets
     */
    function mintNFTBatch(
        uint256[] calldata prices,
        address[] calldata clients,
        uint256 royaltyPercentage,
        uint256 timeStamp,
        TicketStatus status
    ) external onlyOwner whenNotPaused nonReentrant returns (uint256[] memory) {
        if (prices.length != clients.length) revert ArrayLengthMismatch();
        if (prices.length == 0) revert EmptyArrays();
        if (_tokenIdCounter + prices.length > MAX_SUPPLY) revert WouldExceedMaxSupply();

        uint256[] memory tokenIds = new uint256[](prices.length);

        for (uint256 i = 0; i < prices.length; i++) {
            tokenIds[i] = mintNFT(prices[i], clients[i], royaltyPercentage, timeStamp, status);
        }

        return tokenIds;
    }

    /**
     * @notice Set price for ticket resale
     * @dev Only ticket owner can call
     * @param tokenId ID of the ticket
     * @param price New resale price
     */
    function setNFTPrice(uint256 tokenId, uint256 price) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (price == 0) revert PriceMustBeGreaterThanZero();

        NFTDetail storage nft = nftDetails[tokenId];
        TicketStatus oldStatus = nft.status;

        nft.price = price;
        nft.status = TicketStatus.SALE;

        emit TokenPriced(tokenId, price, TicketStatus.SALE);

        if (oldStatus != TicketStatus.SALE) {
            emit TokenStatusChanged(tokenId, oldStatus, TicketStatus.SALE);
        }
    }

    /**
     * @notice Cancel ticket resale
     * @dev Only ticket owner can call. Does NOT delete nftDetails (keeps creator/royalty)
     * @param tokenId ID of the ticket
     */
    function cancelResale(uint256 tokenId) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        NFTDetail storage nft = nftDetails[tokenId];
        if (nft.status != TicketStatus.SALE) revert TicketNotForSale();

        TicketStatus oldStatus = nft.status;
        nft.status = TicketStatus.OPEN;
        nft.price = 0;

        emit ResaleCancelled(tokenId);
        emit TokenStatusChanged(tokenId, oldStatus, TicketStatus.OPEN);
    }

    /**
     * @notice Transfer ticket to another address
     * @dev Only ticket owner can call
     * @param tokenId ID of the ticket
     * @param to Address to transfer to
     */
    function transferNFT(uint256 tokenId, address to) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (to == address(0)) revert InvalidRecipientAddress();

        _transfer(msg.sender, to, tokenId);
    }

    /**
     * @notice Set ticket status (OPEN, CLOSED, SALE)
     * @dev Only ticket owner can call. Validates state transitions.
     * @param newStatus New ticket status
     * @param tokenId ID of the ticket
     */
    function setTicketStatus(TicketStatus newStatus, uint256 tokenId) external nonReentrant {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();

        NFTDetail storage nft = nftDetails[tokenId];
        TicketStatus currentStatus = nft.status;

        // Validate state transitions
        if (currentStatus == TicketStatus.CLOSED) revert TicketAlreadyClosed();

        // CLOSED is a terminal state
        if (newStatus == TicketStatus.CLOSED) {
            if (currentStatus != TicketStatus.OPEN && currentStatus != TicketStatus.SALE) {
                revert InvalidStateTransition();
            }
        }

        nft.status = newStatus;

        emit TokenStatusChanged(tokenId, currentStatus, newStatus);
    }

    /**
     * @notice Get ticket details
     * @param tokenId ID of the ticket
     * @return NFTDetail struct with ticket information
     */
    function getTicketDetails(uint256 tokenId) external view returns (NFTDetail memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return nftDetails[tokenId];
    }

    /**
     * @notice Get total supply of minted tickets
     * @return Current number of minted tickets
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Check if max supply has been reached
     * @return True if all tickets have been minted
     */
    function isMaxSupplyReached() external view returns (bool) {
        return _tokenIdCounter >= MAX_SUPPLY;
    }

    /**
     * @notice Get maximum supply
     * @return Maximum number of tickets that can be minted
     */
    function maxSupply() external view returns (uint256) {
        return MAX_SUPPLY;
    }

    /**
     * @notice Pause contract (emergency stop)
     * @dev Only owner can call
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause contract
     * @dev Only owner can call
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Set base URI for token metadata
     * @dev Only owner can call
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Override base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @dev Check if token exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Override supportsInterface to resolve conflicts
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
