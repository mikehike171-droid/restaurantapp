import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from '../locations/location.entity';
import { Category } from '../categories/category.entity';

@Entity('food_items')
export class FoodItem {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'location_id' }) locationId: number;
  @Column({ name: 'category_id' }) categoryId: number;
  @Column({ length: 150 }) name: string;
  @Column('text', { nullable: true }) description: string;
  @Column('decimal', { precision: 10, scale: 2 }) price: number;
  @Column({ name: 'image_url', nullable: true }) imageUrl: string;
  @Column({ name: 'is_veg', default: true }) isVeg: boolean;
  @Column({ name: 'is_available', default: true }) isAvailable: boolean;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'preparation_time', default: 15 }) preparationTime: number;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column('decimal', { precision: 2, scale: 1, default: 4.5 }) rating: number;
  @Column({ name: 'discount_text', nullable: true }) discountText: string;
  @ManyToOne(() => Location, (l) => l.foodItems) @JoinColumn({ name: 'location_id' }) location: Location;
  @ManyToOne(() => Category, (c) => c.foodItems) @JoinColumn({ name: 'category_id' }) category: Category;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
