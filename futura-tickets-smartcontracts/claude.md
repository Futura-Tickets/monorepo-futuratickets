# FUTURA-TICKETS-SMARTCONTRACTS-MAIN - ANÁLISIS TÉCNICO

## 1. RESUMEN

**Propósito**: Smart contracts en Solidity para NFT tickets usando Scaffold-ETH 2 framework.

**Stack**: Hardhat + Solidity 0.8.25 + OpenZeppelin + Next.js frontend

**Métricas**: 161 líneas de contratos, 2 archivos .sol

---

## 2. ESTRUCTURA

```
futura-tickets-smartcontracts-main/
├── futura-tickets/          # Scaffold-ETH 2 monorepo
│   ├── packages/
│   │   ├── hardhat/        # Smart contracts
│   │   │   ├── contracts/
│   │   │   │   ├── futura-ticket-v1.sol (74 líneas)
│   │   │   │   └── YourContract.sol (87 líneas - template)
│   │   │   ├── deploy/
│   │   │   ├── test/
│   │   │   └── hardhat.config.ts
│   │   └── nextjs/         # Frontend dApp
│   └── package.json
├── js-callers/             # Scripts JS para interactuar con contracts
└── nft-metadata/           # Metadata JSON para NFTs
```

---

## 3. SMART CONTRACT PRINCIPAL

**Archivo**: `futura-ticket-v1.sol` (74 líneas)

### MarketplaceNFT Contract

```solidity
contract MarketplaceNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct NFTDetail {
        uint256 price;
        address creator;
        uint256 royaltyPercentage;
    }

    mapping(uint256 => NFTDetail) public nftDetails;
}
```

### Funciones Principales

**1. mintNFT** (onlyOwner)
```solidity
function mintNFT(
    string memory tokenURI,
    uint256 price,
    uint256 royaltyPercentage
) public onlyOwner returns (uint256)
```
- Mint NFT ticket
- Establece precio y royalty (max 100%)
- Retorna tokenId

**2. purchaseNFT**
```solidity
function purchaseNFT(uint256 tokenId) public payable
```
- Compra NFT por precio fijo
- Transfiere ownership
- Paga al seller

**3. resellNFT**
```solidity
function resellNFT(uint256 tokenId, uint256 resalePrice) public payable
```
- Reventa con royalty al creator
- Calcula royalty: `(resalePrice * royaltyPercentage) / 100`
- Transfiere NFT al comprador

---

## 4. PROBLEMAS CRÍTICOS DETECTADOS

### ⚠️ VULNERABILIDAD CRÍTICA: tx.origin

**Línea 73**: `_transfer(msg.sender, tx.origin, tokenId);`

**Problema**: Uso de `tx.origin` en lugar de un buyer address.

**Exploit**: Un contrato malicioso puede llamar a `resellNFT` y el NFT se transferirá al EOA original, no al comprador legítimo.

**Solución**:
```solidity
function resellNFT(uint256 tokenId, uint256 resalePrice, address buyer) public payable {
    // ...
    _transfer(msg.sender, buyer, tokenId);
}
```

### ⚠️ LÓGICA DE RESALE INCORRECTA

**Línea 63**: `require(msg.value == resalePrice, ...)`

**Problema**: El seller NO debería pagar el resalePrice. El COMPRADOR debe pagarlo.

**Solución**:
```solidity
function resellNFT(uint256 tokenId, uint256 resalePrice) public {
    require(ownerOf(tokenId) == msg.sender, "Not the owner");

    // Update price for next buyer
    nftDetails[tokenId].price = resalePrice;
}

function buyResaleNFT(uint256 tokenId) public payable {
    NFTDetail memory nft = nftDetails[tokenId];
    require(msg.value == nft.price, "Incorrect price");

    // Calculate royalty
    uint256 royalty = (msg.value * nft.royaltyPercentage) / 100;
    uint256 sellerAmount = msg.value - royalty;

    address seller = ownerOf(tokenId);

    payable(nft.creator).transfer(royalty);
    payable(seller).transfer(sellerAmount);

    _transfer(seller, msg.sender, tokenId);
}
```

### ⚠️ NO HAY MARKETPLACE

El contrato solo permite compra directa. Falta:
- Listing system (poner en venta)
- Offers/bidding
- Cancelar listing
- Event emissions

### ⚠️ REENTRANCY

Las funciones `purchaseNFT` y `resellNFT` son vulnerables:
- Transfieren ETH antes de actualizar estado
- No usan ReentrancyGuard

**Solución**: Usar OpenZeppelin ReentrancyGuard

---

## 5. FUNCIONALIDADES FALTANTES

1. **Events**: No emite eventos para indexing
2. **Marketplace listing**: Mecanismo para listar/deslistar
3. **Offers**: Sistema de ofertas
4. **Batch mint**: Mint múltiples tickets
5. **Ticket types**: Diferentes tipos de tickets (VIP, General, etc.)
6. **Expiration**: Tickets que expiran después del evento
7. **Access control**: Roles (PROMOTER_ROLE, VALIDATOR_ROLE)
8. **Pausable**: Emergency stop
9. **Upgradeable**: Proxy pattern para actualizaciones

---

## 6. INTEGRACIÓN CON BACKEND

⚠️ **NO HAY INTEGRACIÓN**: Los backends (admin-api, market-place-api) tienen código blockchain pero no lo usan.

**Archivos Backend**:
- `futura-tickets-admin-api-main/src/abis/EventNFT.json`
- Dependencias: `ethers`, `viem`, `permissionless`

**Estado**: Código preparado pero no desplegado/usado en producción.

---

## 7. SCAFFOLD-ETH 2

El proyecto usa Scaffold-ETH 2:
- Hardhat para desarrollo de contratos
- Next.js frontend con wagmi/viem
- Deployment scripts
- Testing con Chai

**Scripts**:
```json
{
  "chain": "yarn workspace @se-2/hardhat chain",
  "deploy": "yarn workspace @se-2/hardhat deploy",
  "test": "yarn workspace @se-2/hardhat test",
  "start": "yarn workspace @se-2/nextjs dev"
}
```

---

## 8. RECOMENDACIONES

### Crítico (P0)
1. **Eliminar tx.origin**: Usar address buyer parameter
2. **Corregir lógica resale**: Separar listing de compra
3. **Agregar ReentrancyGuard**: Prevenir reentrancy
4. **Emitir events**: Para tracking e indexing

### Alto (P1)
1. **Implementar marketplace completo**: Listing, offers, cancelar
2. **Access control**: Ownable → AccessControl con roles
3. **Pausable**: Emergency stop mechanism
4. **Tests completos**: Unit + integration tests

### Medio (P2)
1. **Ticket types**: Diferentes categorías de tickets
2. **Batch operations**: Mint múltiples tickets gas-efficient
3. **Ticket expiration**: Validación de fecha
4. **Upgradeable**: Proxy pattern (UUPS o Transparent)

### Bajo (P3)
1. **Gas optimization**: Usar uint128 en lugar de uint256 donde aplique
2. **ERC2981**: Standard de royalties
3. **Integration con backend**: Conectar APIs con blockchain
4. **Deploy a mainnet/testnet**: Actualmente no desplegado

---

## 9. ESTADO DEL PROYECTO

**Madurez**: ⚠️ **Prototipo inicial con vulnerabilidades críticas**

**Uso en producción**: ❌ NO (backends no lo usan)

**Testing**: 0% coverage

**Deployment**: ❌ No desplegado

---

## CONCLUSIÓN

Contrato NFT básico con **vulnerabilidades críticas** y **funcionalidad incompleta**. No apto para producción.

**Acción requerida**: Refactorización completa antes de uso.

**Tiempo estimado**: 2-3 semanas (1 developer blockchain + security audit)
