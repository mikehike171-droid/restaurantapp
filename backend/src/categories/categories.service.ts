import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }

  async create(name: string, icon?: string, imageUrl?: string, sortOrder = 0): Promise<Category> {
    const category = this.categoryRepo.create({ name, icon, imageUrl, sortOrder });
    return this.categoryRepo.save(category);
  }

  async update(id: number, name: string, icon?: string, imageUrl?: string, sortOrder = 0): Promise<Category> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new Error(`Category ${id} not found`);

    const updateData: any = { name, sortOrder };
    if (icon !== undefined) updateData.icon = icon;
    if (imageUrl) updateData.imageUrl = imageUrl;
    
    await this.categoryRepo.update(id, updateData);
    return this.categoryRepo.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.categoryRepo.update(id, { isActive: false });
  }
}
