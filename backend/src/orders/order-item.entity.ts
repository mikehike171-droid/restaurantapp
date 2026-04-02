import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { FoodItem } from '../food-items/food-item.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'order_id' }) orderId: number;
  @Column({ name: 'food_item_id' }) foodItemId: number;
  @Column() quantity: number;
  @Column('decimal', { precision: 10, scale: 2, name: 'unit_price' }) unitPrice: number;
  @Column('decimal', { precision: 10, scale: 2, name: 'total_price' }) totalPrice: number;
  @Column({ name: 'special_instructions', nullable: true }) specialInstructions: string;
  @Column({ default: 'pending' }) status: string;
  @ManyToOne(() => Order, (o) => o.items) @JoinColumn({ name: 'order_id' }) order: Order;
  @ManyToOne(() => FoodItem) @JoinColumn({ name: 'food_item_id' }) foodItem: FoodItem;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
