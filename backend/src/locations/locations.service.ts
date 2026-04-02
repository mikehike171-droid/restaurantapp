import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Location } from './location.entity';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
  ) {}

  async findAll(): Promise<Location[]> {
    return this.locationRepo.find({ where: { isActive: true }, order: { name: 'ASC' } });
  }

  async findById(id: number): Promise<Location> {
    const location = await this.locationRepo.findOne({ where: { id } });
    if (!location) throw new NotFoundException(`Location ${id} not found`);
    return location;
  }

  async findByToken(token: string): Promise<Location> {
    const location = await this.locationRepo.findOne({ where: { qrCodeToken: token } });
    if (!location) throw new NotFoundException('Invalid QR code');
    return location;
  }

  async create(dto: CreateLocationDto): Promise<Location> {
    const token = `loc_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const location = this.locationRepo.create({ ...dto, qrCodeToken: token });
    return this.locationRepo.save(location);
  }

  async update(id: number, dto: UpdateLocationDto): Promise<Location> {
    await this.findById(id);
    await this.locationRepo.update(id, dto as any);
    return this.findById(id);
  }

  async updateQrCode(id: number, qrCodeUrl: string): Promise<void> {
    await this.locationRepo.update(id, { qrCodeUrl });
  }

  async getLocationStats(id: number) {
    const location = await this.findById(id);
    const result = await this.locationRepo.query(`
      SELECT 
        (
          SELECT COUNT(DISTINCT o.id) FROM orders o
          WHERE o.location_id = $1 AND o.status NOT IN ('cancelled', 'completed')
        ) as active_orders,
        (
          SELECT COUNT(DISTINCT o.id) FROM orders o
          WHERE o.location_id = $1 AND DATE(o.created_at) = CURRENT_DATE
        ) as today_orders,
        (
          SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o
          WHERE o.location_id = $1 AND DATE(o.created_at) = CURRENT_DATE
          AND o.status = 'completed'
        ) as today_revenue,
        (
          SELECT COUNT(*) FROM restaurant_tables rt
          WHERE rt.location_id = $1 AND rt.is_available = false
        ) as occupied_tables,
        (
          SELECT COUNT(*) FROM restaurant_tables rt
          WHERE rt.location_id = $1
        ) as total_tables
    `, [id]);
    return { location, stats: result[0] };
  }
}
