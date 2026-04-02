import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { FoodItem } from '../food-items/food-item.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 100 }) name: string;
  @Column({ nullable: true }) icon: string;
  @Column({ name: 'image_url', nullable: true }) imageUrl: string;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @OneToMany(() => FoodItem, (fi) => fi.category) foodItems: FoodItem[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
