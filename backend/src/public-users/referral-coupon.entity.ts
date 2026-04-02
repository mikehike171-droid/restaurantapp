import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PublicUser } from './public-user.entity';

@Entity('referral_coupons')
export class ReferralCoupon {
  @PrimaryGeneratedColumn() id: number;

  @Column({ name: 'public_user_id' }) publicUserId: number;
  @ManyToOne(() => PublicUser) @JoinColumn({ name: 'public_user_id' }) publicUser: PublicUser;

  @Column('decimal', { precision: 10, scale: 2, default: 100 }) amount: number;
  @Column({ unique: true, length: 20 }) code: string;
  @Column({ name: 'is_used', default: false }) isUsed: boolean;

  @Column({ name: 'referred_user_id', nullable: true }) referredUserId: number;
  @ManyToOne(() => PublicUser) @JoinColumn({ name: 'referred_user_id' }) referredUser: PublicUser;

  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
