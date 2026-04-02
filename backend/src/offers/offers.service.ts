import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Offer } from './offer.entity';
import { CreateOfferDto, UpdateOfferDto } from './offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepo: Repository<Offer>,
  ) {}

  async findAll(): Promise<Offer[]> {
    return this.offerRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findActive(): Promise<Offer[]> {
    return this.offerRepo.find({
      where: { isActive: true },
      order: { minAmount: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Offer> {
    const offer = await this.offerRepo.findOne({ where: { id } });
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async create(dto: CreateOfferDto): Promise<Offer> {
    const offer = this.offerRepo.create(dto);
    return this.offerRepo.save(offer);
  }

  async update(id: number, dto: UpdateOfferDto): Promise<Offer> {
    const offer = await this.findOne(id);
    this.offerRepo.merge(offer, dto);
    return this.offerRepo.save(offer);
  }

  async remove(id: number): Promise<void> {
    const offer = await this.findOne(id);
    await this.offerRepo.remove(offer);
  }
}
