/**
 * IQRCodeService - Port
 *
 * Define el contrato para generar QR codes
 * El dominio NO conoce los detalles de implementación
 */
export interface IQRCodeService {
  /**
   * Generar QR code para un ticket
   */
  generate(data: string): Promise<string>; // Returns QR code data (base64, url, etc.)

  /**
   * Verificar validez de un QR code
   */
  verify(qrCode: string, expectedData: string): Promise<boolean>;
}
