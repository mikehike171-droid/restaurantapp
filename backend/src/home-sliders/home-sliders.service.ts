import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeSlider } from './home-slider.entity';
import { CreateHomeSliderDto, UpdateHomeSliderDto } from './dto/home-slider.dto';

@Injectable()
export class HomeSlidersService {
  constructor(
    @InjectRepository(HomeSlider)
    private readonly sliderRepo: Repository<HomeSlider>,
  ) {}

  async findAll(): Promise<HomeSlider[]> {
    return this.sliderRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async create(dto: CreateHomeSliderDto): Promise<HomeSlider> {
    const slider = this.sliderRepo.create(dto);
    return this.sliderRepo.save(slider);
  }

  async update(id: number, dto: UpdateHomeSliderDto): Promise<HomeSlider> {
    await this.sliderRepo.update(id, dto);
    const slider = await this.sliderRepo.findOne({ where: { id } });
    if (!slider) throw new NotFoundException(`Slider ${id} not found`);
    return slider;
  }

  async delete(id: number): Promise<void> {
    const slider = await this.sliderRepo.findOne({ where: { id } });
    if (!slider) throw new NotFoundException(`Slider ${id} not found`);
    await this.sliderRepo.delete(id);
  }
}
