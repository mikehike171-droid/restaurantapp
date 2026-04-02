import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('pincodes')
export class Pincode {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 10 }) pincode: string;
  @Column({ name: 'area_name', length: 100 }) areaName: string;
  @Column({ name: 'location_id' }) locationId: number;
  @Column('decimal', { precision: 10, scale: 2, name: 'delivery_charge', default: 0 }) deliveryCharge: number;
  @Column('decimal', { precision: 10, scale: 2, name: 'min_order_amount', default: 0 }) minOrderAmount: number;
  @Column({ name: 'estimated_delivery_time', default: '30-45 mins' }) estimatedDeliveryTime: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @ManyToOne(() => Location) @JoinColumn({ name: 'location_id' }) location: Location;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
