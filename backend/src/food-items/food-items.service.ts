import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FoodItem } from './food-item.entity';
import { Category } from '../categories/category.entity';
import { CreateFoodItemDto, UpdateFoodItemDto } from './dto/food-item.dto';

@Injectable()
export class FoodItemsService {
  constructor(
    @InjectRepository(FoodItem)
    private readonly foodItemRepo: Repository<FoodItem>,
  ) {}

  // Get menu grouped by category for a location
  async getMenuByLocation(locationId: number) {
    const items = await this.foodItemRepo.createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.location_id = :locationId', { locationId })
      .andWhere('item.is_active = :isActive', { isActive: true })
      .orderBy('category.sortOrder', 'ASC')
      .addOrderBy('item.sortOrder', 'ASC')
      .getMany();

    if (!items.length) return [];

    // Group by category
    const grouped = items.reduce((acc, item) => {
      const catId = item.categoryId;
      if (!acc[catId]) {
        acc[catId] = { category: item.category, items: [] };
      }
      acc[catId].items.push(item);
      return acc;
    }, {} as Record<number, { category: Category; items: FoodItem[] }>);

    return Object.values(grouped);
  }

  async getByLocationAndCategory(locationId: number, categoryId: number): Promise<FoodItem[]> {
    return this.foodItemRepo.find({
      where: { locationId, categoryId, isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAllByLocation(locationId: number): Promise<FoodItem[]> {
    return this.foodItemRepo.find({
      where: { locationId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<FoodItem> {
    const item = await this.foodItemRepo.findOne({ where: { id }, relations: ['category', 'location'] });
    if (!item) throw new NotFoundException(`Food item ${id} not found`);
    return item;
  }

  async create(dto: CreateFoodItemDto): Promise<FoodItem> {
    const item = this.foodItemRepo.create(dto);
    return this.foodItemRepo.save(item);
  }

  async update(id: number, dto: UpdateFoodItemDto): Promise<FoodItem> {
    await this.findById(id);
    await this.foodItemRepo.update(id, dto as any);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.foodItemRepo.delete(id);
  }

  async toggleAvailability(id: number): Promise<FoodItem> {
    const item = await this.findById(id);
    await this.foodItemRepo.update(id, { isAvailable: !item.isAvailable });
    return this.findById(id);
  }

  async toggleActive(id: number): Promise<FoodItem> {
    const item = await this.findById(id);
    await this.foodItemRepo.update(id, { isActive: !item.isActive });
    return this.findById(id);
  }
}
