// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {FuturaEvent} from "./FuturaEvent.sol";

/**
 * @title FuturaEventFactory
 * @dev Factory contract to deploy individual FuturaEvent contracts
 * @notice Each event gets its own isolated NFT contract
 */
contract FuturaEventFactory {

    // ==================== CUSTOM ERRORS ====================

    /// @notice Thrown when owner address is zero
    error InvalidOwnerAddress();

    /// @notice Thrown when event name is empty
    error EventNameCannotBeEmpty();

    /// @notice Thrown when max supply is zero
    error MaxSupplyMustBeGreaterThanZero();

    /// @notice Thrown when event does not exist
    error EventDoesNotExist();

    // ==================== STATE VARIABLES ====================

    /// @notice Mapping from event ID to deployed contract address
    mapping(uint256 => address) public eventContracts;

    /// @notice Counter for event IDs
    uint256 private eventIdCounter;

    // ==================== EVENTS ====================

    /// @notice Event emitted when a new FuturaEvent contract is created
    event FuturaEventCreated(
        uint256 indexed eventId,
        address indexed contractAddress,
        address indexed owner,
        string eventName,
        uint256 maxSupply
    );

    /**
     * @notice Create a new FuturaEvent contract
     * @dev Deploys a new contract and stores its address
     * @param owner Address of the event owner (promoter)
     * @param eventName Name of the event
     * @param maxSupply Maximum number of tickets for this event
     * @param baseURI Base URI for token metadata
     * @return eventId ID of the created event
     * @return contractAddress Address of the deployed contract
     */
    function createNew(
        address owner,
        string memory eventName,
        uint256 maxSupply,
        string memory baseURI
    ) public returns (uint256 eventId, address contractAddress) {
        if (owner == address(0)) revert InvalidOwnerAddress();
        if (bytes(eventName).length == 0) revert EventNameCannotBeEmpty();
        if (maxSupply == 0) revert MaxSupplyMustBeGreaterThanZero();

        eventIdCounter++;
        eventId = eventIdCounter;

        // Deploy new FuturaEvent contract
        FuturaEvent futuraEvent = new FuturaEvent(owner, eventName, maxSupply, baseURI);
        contractAddress = address(futuraEvent);

        // Store contract address
        eventContracts[eventId] = contractAddress;

        emit FuturaEventCreated(eventId, contractAddress, owner, eventName, maxSupply);

        return (eventId, contractAddress);
    }

    /**
     * @notice Get contract address for an event ID
     * @param eventId ID of the event
     * @return Contract address
     */
    function getEventContract(uint256 eventId) external view returns (address) {
        if (eventContracts[eventId] == address(0)) revert EventDoesNotExist();
        return eventContracts[eventId];
    }

    /**
     * @notice Get total number of events created
     * @return Total event count
     */
    function getTotalEvents() external view returns (uint256) {
        return eventIdCounter;
    }
}
