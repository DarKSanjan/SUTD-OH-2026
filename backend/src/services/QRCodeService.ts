import QRCode from 'qrcode';

export interface QRCodeData {
  token: string;
  studentId: string;
}

export class QRCodeService {
  /**
   * Generate a QR code from data
   * Returns a base64 data URL for display
   * Error correction level: M (15% recovery)
   */
  async generateQRCode(data: QRCodeData): Promise<string> {
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Generate QR code with error correction level M
    const qrCodeDataUrl = await QRCode.toDataURL(jsonData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
    });
    
    return qrCodeDataUrl;
  }
}

export default new QRCodeService();
