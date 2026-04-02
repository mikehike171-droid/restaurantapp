import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Pincode } from './pincode.entity';
import { PincodeDemand } from './pincode-demand.entity';
import { CreatePincodeDto, UpdatePincodeDto, NotifyDemandDto } from './pincode.dto';

@Injectable()
export class PincodesService {
  constructor(
    @InjectRepository(Pincode) private readonly pincodeRepo: Repository<Pincode>,
    @InjectRepository(PincodeDemand) private readonly demandRepo: Repository<PincodeDemand>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ---- Admin ----
  async findAll(): Promise<Pincode[]> {
    return this.pincodeRepo.find({ relations: ['location'], order: { createdAt: 'DESC' } });
  }

  async create(dto: CreatePincodeDto): Promise<Pincode> {
    const pincode = this.pincodeRepo.create(dto);
    return this.pincodeRepo.save(pincode);
  }

  async update(id: number, dto: UpdatePincodeDto): Promise<Pincode> {
    const pincode = await this.pincodeRepo.findOne({ where: { id } });
    if (!pincode) throw new NotFoundException(`Pincode ${id} not found`);
    await this.pincodeRepo.update(id, dto as any);
    return this.pincodeRepo.findOne({ where: { id }, relations: ['location'] });
  }

  async remove(id: number): Promise<void> {
    const pincode = await this.pincodeRepo.findOne({ where: { id } });
    if (!pincode) throw new NotFoundException(`Pincode ${id} not found`);
    await this.pincodeRepo.delete(id);
  }

  async toggleStatus(id: number): Promise<Pincode> {
    const pincode = await this.pincodeRepo.findOne({ where: { id } });
    if (!pincode) throw new NotFoundException(`Pincode ${id} not found`);
    await this.pincodeRepo.update(id, { isActive: !pincode.isActive });
    return this.pincodeRepo.findOne({ where: { id }, relations: ['location'] });
  }

  async bulkCreate(rows: CreatePincodeDto[]): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = [];
    let created = 0;
    for (const row of rows) {
      try {
        await this.create(row);
        created++;
      } catch (e) {
        errors.push(`${row.pincode}: ${e.message}`);
      }
    }
    return { created, errors };
  }

  // ---- Customer / Public ----
  async checkPincode(pincode: string) {
    const zones = await this.pincodeRepo.find({
      where: { pincode, isActive: true },
      relations: ['location'],
    });

    if (!zones.length) {
      return { serviceable: false, pincode, message: 'Service not available in your area' };
    }

    return {
      serviceable: true,
      pincode,
      zones: zones.map(z => ({
        id: z.id,
        areaName: z.areaName,
        deliveryCharge: z.deliveryCharge,
        minOrderAmount: z.minOrderAmount,
        estimatedDeliveryTime: z.estimatedDeliveryTime,
        branch: {
          id: z.location.id,
          name: z.location.name,
          address: z.location.address,
          city: z.location.city,
          phone: z.location.phone,
        },
      })),
    };
  }

  async getBranchByPincode(pincode: string) {
    const zone = await this.pincodeRepo.findOne({
      where: { pincode, isActive: true },
      relations: ['location'],
    });
    if (!zone) throw new NotFoundException('Service not available in your area');
    return {
      pincode: zone.pincode,
      areaName: zone.areaName,
      deliveryCharge: zone.deliveryCharge,
      minOrderAmount: zone.minOrderAmount,
      estimatedDeliveryTime: zone.estimatedDeliveryTime,
      locationId: zone.locationId,
      branch: zone.location,
    };
  }

  async suggest(q: string): Promise<Pincode[]> {
    if (!q || q.length < 2) return [];
    return this.pincodeRepo.find({
      where: [
        { pincode: ILike(`%${q}%`), isActive: true },
        { areaName: ILike(`%${q}%`), isActive: true },
      ],
      relations: ['location'],
      take: 10,
    });
  }

  async notifyDemand(dto: NotifyDemandDto): Promise<{ message: string }> {
    const demand = this.demandRepo.create(dto);
    await this.demandRepo.save(demand);
    return { message: 'We will notify you when service is available in your area' };
  }

  async reverseGeocode(lat: number, lng: number): Promise<{ pincode: string; area: string }> {
    const apiKey = this.configService.get<string>('OPENCAGE_API_KEY');
    if (!apiKey || apiKey === 'your_opencage_api_key_here') {
      // Fallback for testing: return a known pincode if key is missing
      return { pincode: '500072', area: 'KPHB Colony' };
    }
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=en&pretty=0`;
      const { data } = await firstValueFrom(this.httpService.get(url));
      const result = data?.results?.[0];
      const pincode = result?.components?.postcode || '';
      const area = result?.components?.suburb || result?.components?.neighbourhood || result?.components?.city_district || '';
      return { pincode, area };
    } catch {
      return { pincode: '', area: '' };
    }
  }
}
