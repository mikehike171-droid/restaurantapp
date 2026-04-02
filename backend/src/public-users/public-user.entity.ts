import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../orders/order.entity';

@Entity('public_users')
export class PublicUser {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 150 }) name: string;
  @Column({ unique: true, length: 150 }) email: string;
  @Column({ select: false }) password: string;
  @Column({ length: 20, nullable: true }) phone: string;
  @Column({ name: 'current_pincode', length: 10, nullable: true }) currentPincode: string;
  @Column({ name: 'referral_code', unique: true, length: 10, nullable: true }) referralCode: string;
  @Column({ name: 'referred_by_id', nullable: true }) referredById: number;
  
  @OneToMany(() => Order, (order) => order.publicUser) orders: Order[];
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
