import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from '../locations/location.entity';
import { RestaurantTable } from './table.entity';
import { OrderItem } from './order-item.entity';
import { PublicUser } from '../public-users/public-user.entity';

export enum OrderStatus {
  PENDING = 'pending',
  WAITING = 'waiting',
  PREPARING = 'preparing',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  EATING = 'eating',
  PAYMENT_DUE = 'payment_due',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'order_number', unique: true }) orderNumber: string;
  @Column({ name: 'location_id' }) locationId: number;
  @Column({ name: 'table_id', nullable: true }) tableId: number;
  @Column({ name: 'public_user_id', nullable: true }) publicUserId: number;
  @ManyToOne(() => PublicUser, (u) => u.orders) @JoinColumn({ name: 'public_user_id' }) publicUser: PublicUser;
  @Column({ name: 'customer_name', nullable: true }) customerName: string;
  @Column({ name: 'customer_phone', nullable: true }) customerPhone: string;
  @Column({ name: 'customer_address', nullable: true }) customerAddress: string;
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING }) status: OrderStatus;
  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount', default: 0 }) totalAmount: number;
  @Column('decimal', { precision: 10, scale: 2, name: 'discount_amount', default: 0 }) discountAmount: number;
  @Column({ name: 'applied_offer_id', nullable: true }) appliedOfferId: number;
  @Column({ nullable: true }) notes: string;
  @ManyToOne(() => Location, (l) => l.orders) @JoinColumn({ name: 'location_id' }) location: Location;
  @ManyToOne(() => RestaurantTable, { nullable: true }) @JoinColumn({ name: 'table_id' }) table: RestaurantTable;
  @OneToMany(() => OrderItem, (oi) => oi.order, { cascade: true }) items: OrderItem[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
