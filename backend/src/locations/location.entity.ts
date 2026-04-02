import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FoodItem } from '../food-items/food-item.entity';
import { Order } from '../orders/order.entity';
import { RestaurantTable } from '../orders/table.entity';

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column('text')
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ name: 'qr_code_url', nullable: true })
  qrCodeUrl: string;

  @Column({ name: 'qr_code_token', unique: true })
  qrCodeToken: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => FoodItem, (item) => item.location)
  foodItems: FoodItem[];

  @OneToMany(() => Order, (order) => order.location)
  orders: Order[];

  @OneToMany(() => RestaurantTable, (table) => table.location)
  tables: RestaurantTable[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
