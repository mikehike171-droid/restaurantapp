import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { PublicUser } from '../public-users/public-user.entity';
import { FoodItem } from '../food-items/food-item.entity';

@Entity('wishlist')
@Unique(['publicUserId', 'foodItemId'])
export class Wishlist {
  @PrimaryGeneratedColumn() id: number;

  @Column({ name: 'public_user_id' }) publicUserId: number;
  @ManyToOne(() => PublicUser) @JoinColumn({ name: 'public_user_id' }) publicUser: PublicUser;

  @Column({ name: 'food_item_id' }) foodItemId: number;
  @ManyToOne(() => FoodItem) @JoinColumn({ name: 'food_item_id' }) foodItem: FoodItem;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
