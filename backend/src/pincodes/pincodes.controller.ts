import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PincodesService } from './pincodes.service';
import { CreatePincodeDto, UpdatePincodeDto, NotifyDemandDto } from './pincode.dto';

@ApiTags('Pincodes')
@Controller()
export class PincodesController {
  constructor(private readonly pincodesService: PincodesService) {}

  // ---- Admin routes ----
  @Get('admin/pincodes')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List all pincodes (admin)' })
  findAll() { return this.pincodesService.findAll(); }

  @Post('admin/pincodes')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Add pincode zone (admin)' })
  create(@Body() dto: CreatePincodeDto) { return this.pincodesService.create(dto); }

  @Put('admin/pincodes/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pincode (admin)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePincodeDto) { return this.pincodesService.update(id, dto); }

  @Delete('admin/pincodes/:id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete pincode (admin)' })
  remove(@Param('id', ParseIntPipe) id: number) { return this.pincodesService.remove(id); }

  @Patch('admin/pincodes/:id/status')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle pincode active/inactive (admin)' })
  toggleStatus(@Param('id', ParseIntPipe) id: number) { return this.pincodesService.toggleStatus(id); }

  @Post('admin/pincodes/bulk')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk import pincodes (admin)' })
  bulkCreate(@Body() body: { rows: CreatePincodeDto[] }) { return this.pincodesService.bulkCreate(body.rows); }

  // ---- Customer / Public routes ----
  @Get('pincodes/check')
  @ApiOperation({ summary: 'Check if pincode is serviceable' })
  @ApiQuery({ name: 'pincode', required: true })
  check(@Query('pincode') pincode: string) { return this.pincodesService.checkPincode(pincode); }

  @Get('pincodes/branch')
  @ApiOperation({ summary: 'Get branch + delivery info for pincode' })
  @ApiQuery({ name: 'pincode', required: true })
  getBranch(@Query('pincode') pincode: string) { return this.pincodesService.getBranchByPincode(pincode); }

  @Get('pincodes/suggest')
  @ApiOperation({ summary: 'Autocomplete pincodes by area name or code' })
  @ApiQuery({ name: 'q', required: true })
  suggest(@Query('q') q: string) { return this.pincodesService.suggest(q); }

  @Post('pincodes/notify')
  @ApiOperation({ summary: 'Register demand for unserviceable pincode' })
  notify(@Body() dto: NotifyDemandDto) { return this.pincodesService.notifyDemand(dto); }

  @Get('geocode')
  @ApiOperation({ summary: 'Reverse geocode lat/lng to pincode' })
  @ApiQuery({ name: 'lat', required: true })
  @ApiQuery({ name: 'lng', required: true })
  geocode(@Query('lat') lat: string, @Query('lng') lng: string) {
    return this.pincodesService.reverseGeocode(parseFloat(lat), parseFloat(lng));
  }
}
