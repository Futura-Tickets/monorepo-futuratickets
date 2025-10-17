/**
 * IBlockchainService - Port
 *
 * Define el contrato para interactuar con blockchain
 * El dominio NO conoce los detalles de implementación (ethers, viem, etc.)
 */
export interface IBlockchainService {
  /**
   * Establecer precio de reventa de un NFT
   */
  setNFTPrice(
    accountPrivateKey: string,
    eventAddress: string,
    tokenId: number,
    price: number,
  ): Promise<string>; // Returns transaction hash

  /**
   * Cancelar reventa de un NFT
   */
  cancelNFTResale(
    accountPrivateKey: string,
    eventAddress: string,
    tokenId: number,
  ): Promise<string>; // Returns transaction hash

  /**
   * Transferir NFT a otro wallet
   */
  transferNFT(
    accountPrivateKey: string,
    eventAddress: string,
    tokenId: number,
    toAddress: string,
  ): Promise<string>; // Returns transaction hash
}
