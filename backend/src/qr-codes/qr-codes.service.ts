import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class QrCodesService {
  constructor(private readonly locationsService: LocationsService) {}

  async generateQrCode(locationId: number, frontendBaseUrl: string): Promise<{ qrCodeDataUrl: string; scanUrl: string }> {
    const location = await this.locationsService.findById(locationId);
    const scanUrl = `${frontendBaseUrl}/scan/${location.qrCodeToken}`;

    const qrCodeDataUrl = await QRCode.toDataURL(scanUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    // Save QR URL to location
    await this.locationsService.updateQrCode(locationId, qrCodeDataUrl);

    return { qrCodeDataUrl, scanUrl };
  }

  async generateQrCodeBuffer(locationId: number, frontendBaseUrl: string): Promise<Buffer> {
    const location = await this.locationsService.findById(locationId);
    const scanUrl = `${frontendBaseUrl}/scan/${location.qrCodeToken}`;
    return QRCode.toBuffer(scanUrl, { width: 400, margin: 2 });
  }
}
