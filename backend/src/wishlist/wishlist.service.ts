import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist) private readonly wishlistRepo: Repository<Wishlist>,
  ) {}

  async toggleWishlist(publicUserId: number, foodItemId: number): Promise<{ added: boolean }> {
    const existing = await this.wishlistRepo.findOne({ where: { publicUserId, foodItemId } });
    
    if (existing) {
      await this.wishlistRepo.delete(existing.id);
      return { added: false };
    } else {
      const entry = this.wishlistRepo.create({ publicUserId, foodItemId });
      await this.wishlistRepo.save(entry);
      return { added: true };
    }
  }

  async getUserWishlist(publicUserId: number): Promise<Wishlist[]> {
    return this.wishlistRepo.find({
      where: { publicUserId },
      relations: ['foodItem', 'foodItem.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async isItemInWishlist(publicUserId: number, foodItemId: number): Promise<boolean> {
    const count = await this.wishlistRepo.count({ where: { publicUserId, foodItemId } });
    return count > 0;
  }
}
