# 🔐 Security Policy

## Version Support

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 2.0.x   | :white_check_mark: | Active |
| 1.0.x   | :x:                | Deprecated |

---

## Reporting a Vulnerability

**⚠️ DO NOT** report security vulnerabilities through public GitHub issues.

### How to Report

1. **Email**: security@futuratickets.com (preferred)
2. **Encrypted**: Use PGP key if available
3. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Time

- **Acknowledgment**: Within 24-48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Depends on severity (see below)

### Severity Levels

| Severity | Response Time | Examples |
|----------|---------------|----------|
| **Critical** | 24-48 hours | Funds at risk, contract takeover |
| **High** | 1 week | Access control bypass, reentrancy |
| **Medium** | 2 weeks | DoS, gas optimization issues |
| **Low** | 1 month | Informational, best practices |

---

## Security Measures Implemented

### Smart Contract Security

#### ✅ OpenZeppelin Contracts v5.4.0
- **ReentrancyGuard**: Prevents reentrancy attacks on critical functions
- **Pausable**: Emergency stop mechanism for all operations
- **Ownable**: Access control for admin functions
- **ERC721**: Standard NFT implementation with security best practices
- **ERC2981**: Royalty standard implementation

#### ✅ Access Control
```solidity
// Only owner can mint tickets
function mintNFT(...) public onlyOwner whenNotPaused nonReentrant

// Only token owner can modify their ticket
function setNFTPrice(...) public {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");
}
```

#### ✅ Input Validation
```solidity
// Royalty percentage validation
require(royaltyPercentage <= 100, "Royalty percentage too high");

// Max supply enforcement
require(_tokenIdCounter < maxSupply, "Max supply reached");
```

#### ✅ Safe Math
- Solidity 0.8.25 with built-in overflow/underflow protection
- No unchecked arithmetic operations

#### ✅ Immutable Configuration
```solidity
uint256 public immutable maxSupply;  // Cannot be changed after deployment
```

### Development & Testing

#### ✅ Comprehensive Testing
- **18+ test cases** covering all functionality
- **Security-specific tests** for attack vectors
- **Gas optimization tests** to detect inefficiencies
- **100% passing rate** on all tests

#### ✅ Continuous Integration
- Automated testing on every commit
- Gas reporter for optimization tracking
- Solidity linter (solhint) for best practices

#### ✅ Code Quality
- TypeScript for type safety in scripts
- Prettier + Solhint for consistent formatting
- Hardhat for professional development environment

---

## Known Limitations & Risks

### ⚠️ Pre-Audit Status

**This code has NOT been professionally audited.**

Before mainnet deployment:
1. ✅ Complete internal security review
2. ⏳ **Pending**: Professional security audit
3. ⏳ **Pending**: Bug bounty program
4. ⏳ **Pending**: Formal verification

### ⚠️ Identified Risks

#### 1. Centralization Risk
- **Issue**: Owner has significant control (mint, pause)
- **Mitigation**:
  - Document owner responsibilities
  - Consider multi-sig wallet for owner
  - Implement timelock for critical operations
- **Status**: ⏳ Planned

#### 2. Metadata Centralization
- **Issue**: baseURI controlled by owner
- **Mitigation**:
  - Use IPFS for immutable metadata
  - Pin metadata on multiple nodes
- **Status**: ⏳ Planned

#### 3. Price Manipulation
- **Issue**: Ticket owners can set arbitrary prices
- **Mitigation**:
  - Already implemented: No restrictions (by design)
  - Market determines fair prices
- **Status**: ✅ Accepted risk

#### 4. Gas Price Variability
- **Issue**: Network congestion can make transactions expensive
- **Mitigation**:
  - Deploy on Base (low fees)
  - Optimize gas usage
  - Consider gasless transactions (EIP-2771)
- **Status**: ✅ Partially mitigated

---

## Security Audit Checklist

### Pre-Deployment

- [x] All tests passing
- [x] Security tests implemented
- [x] Access control validated
- [x] ReentrancyGuard on critical functions
- [x] Input validation on all public functions
- [x] Pausable for emergency stops
- [x] Max supply enforcement
- [x] ERC-721 standard compliance
- [x] ERC-2981 royalty standard
- [ ] Slither static analysis (run `npm run security:audit`)
- [ ] Gas optimization review
- [ ] Professional security audit
- [ ] Bug bounty program
- [ ] Formal verification (optional)

### Testnet Deployment

- [ ] Deploy to Base Sepolia
- [ ] Full E2E testing
- [ ] Stress testing (high load)
- [ ] Economic attack simulation
- [ ] Front-running analysis
- [ ] MEV vulnerability assessment

### Mainnet Deployment

- [ ] Complete all testnet checks
- [ ] Professional audit report reviewed
- [ ] All critical/high issues fixed
- [ ] Multi-sig setup for owner
- [ ] Monitoring and alerting configured
- [ ] Incident response plan documented
- [ ] Bug bounty program active

---

## Security Best Practices for Users

### For Promoters (Event Creators)

1. **Secure Your Private Keys**
   - Use hardware wallet (Ledger, Trezor)
   - Never share private keys
   - Use strong passwords for encrypted keys

2. **Owner Responsibilities**
   - You control who can mint tickets
   - You can pause the contract in emergencies
   - Set appropriate royalty percentages (5-10% recommended)

3. **Metadata Best Practices**
   - Host metadata on IPFS (immutable)
   - Include all ticket details in metadata
   - Ensure baseURI is properly configured

### For Ticket Buyers

1. **Verify Contract Address**
   - Always check contract address on Basescan
   - Verify it matches official documentation
   - Be cautious of fake contracts

2. **Check Token Details**
   - Verify ticket authenticity before purchase
   - Check royalty percentage
   - Verify ticket status (OPEN, CLOSED, SALE)

3. **Resale Market**
   - Set reasonable prices
   - Understand royalties go to original creator
   - Cancel listings when ticket is used

### For Developers (Backend Integration)

1. **Secure RPC Endpoints**
   - Use private RPC nodes when possible
   - Rate limit public endpoints
   - Never expose private keys in code

2. **Transaction Management**
   - Implement proper nonce management
   - Handle failed transactions gracefully
   - Set appropriate gas limits

3. **Event Monitoring**
   - Listen to contract events for state changes
   - Implement proper error handling
   - Use EventMonitor library for reliability

---

## Vulnerability Disclosure Program

### Scope

**In Scope:**
- Smart contracts in `contracts/` directory
- Deployment scripts
- Backend integration libraries
- Any code that interacts with blockchain

**Out of Scope:**
- Third-party dependencies (report to vendors)
- Known issues listed in this document
- Social engineering attacks
- Physical security

### Rewards

Bug bounty program details will be announced before mainnet deployment.

Expected reward ranges:
- **Critical**: Up to $10,000 USD
- **High**: $2,000 - $5,000 USD
- **Medium**: $500 - $2,000 USD
- **Low**: $100 - $500 USD

---

## Security Tools & Commands

### Run Security Audit

```bash
# Complete security audit (Slither, Solhint, Coverage, Gas)
npm run security:audit

# Individual tools
npm run test                    # Run all tests
npm run test:security          # Run security-specific tests
npm run test:coverage          # Code coverage report
npm run test:gas               # Gas optimization report
npm run lint                   # Solidity linter
```

### Manual Security Checks

```bash
# Check contract sizes (avoid hitting 24kb limit)
npx hardhat size-contracts

# Flatten contracts for verification
npm run flatten

# Verify on Basescan (after deployment)
npm run verify:baseSepolia
npm run verify:base
```

---

## Emergency Response Plan

### If Vulnerability Discovered

1. **Assess Severity**
   - Critical: Funds at risk → Execute immediately
   - High: Significant risk → Within 24 hours
   - Medium/Low: Plan fix for next release

2. **Immediate Actions** (Critical)
   - **Pause contract**: `eventContract.pause()`
   - Notify all users via official channels
   - Assess impact (funds affected, users impacted)

3. **Communication**
   - Transparency with users
   - Coordinate with security researchers
   - Publish post-mortem after fix

4. **Fix & Recovery**
   - Develop fix in private
   - Test thoroughly
   - Deploy fixed version
   - Migrate state if necessary

---

## Security Contacts

- **Email**: security@futuratickets.com
- **Twitter**: @FuturaTickets_Security
- **Discord**: FuturaTickets Security Channel

---

## Acknowledgments

We thank the security researchers and community members who help keep FuturaTickets secure.

**Hall of Fame** (Security Contributors):
- (Will be updated as we receive reports)

---

## Updates to This Policy

This security policy is reviewed quarterly and updated as needed.

**Last Updated**: 2025-10-17
**Version**: 2.0.1
**Next Review**: 2026-01-17

---

## Additional Resources

- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/security)
- [Smart Contract Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Ethereum Security](https://ethereum.org/en/developers/docs/smart-contracts/security/)
- [Base Security Guidelines](https://docs.base.org/security/)

---

**Remember**: Security is an ongoing process, not a one-time event. Stay vigilant! 🔐
