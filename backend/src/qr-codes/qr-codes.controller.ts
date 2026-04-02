import { Controller, Get, Post, Param, Res, UseGuards, ParseIntPipe } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { QrCodesService } from './qr-codes.service';

@ApiTags('QR Codes')
@Controller('qr-codes')
export class QrCodesController {
  constructor(
    private readonly qrCodesService: QrCodesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('generate/:locationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async generateQr(@Param('locationId', ParseIntPipe) locationId: number) {
    const baseUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    return this.qrCodesService.generateQrCode(locationId, baseUrl);
  }

  @Get('download/:locationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async downloadQr(@Param('locationId', ParseIntPipe) locationId: number, @Res() res: Response) {
    const baseUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
    const buffer = await this.qrCodesService.generateQrCodeBuffer(locationId, baseUrl);
    res.set({ 'Content-Type': 'image/png', 'Content-Disposition': `attachment; filename=qr-${locationId}.png` });
    res.send(buffer);
  }
}
