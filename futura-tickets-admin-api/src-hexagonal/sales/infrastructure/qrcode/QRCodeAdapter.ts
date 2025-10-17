import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { IQRCodeService } from '../../domain/services/IQRCodeService';

/**
 * QRCodeAdapter - Adapter
 *
 * Implementación concreta del puerto IQRCodeService
 * Infrastructure Layer - Detalles de generación de QR
 *
 * Hexagonal Architecture: Adapter que implementa un Port
 */
@Injectable()
export class QRCodeAdapter implements IQRCodeService {
  async generate(data: string): Promise<string> {
    try {
      // Generar QR code como Data URL (base64)
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
      });

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error}`);
    }
  }

  async verify(qrCode: string, expectedData: string): Promise<boolean> {
    // En una implementación real, podrías decodificar el QR
    // Por ahora, simplemente comparamos strings
    return qrCode.includes(expectedData);
  }
}
