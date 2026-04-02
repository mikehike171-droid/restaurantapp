import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Location } from '../locations/location.entity';

@Entity('restaurant_tables')
export class RestaurantTable {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'location_id' }) locationId: number;
  @Column({ name: 'table_number', length: 20 }) tableNumber: string;
  @Column({ default: 4 }) capacity: number;
  @Column({ name: 'is_available', default: true }) isAvailable: boolean;
  @ManyToOne(() => Location) @JoinColumn({ name: 'location_id' }) location: Location;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
