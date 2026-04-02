import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('home_sliders')
export class HomeSlider {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'image_url' }) imageUrl: string;
  @Column({ nullable: true }) title: string;
  @Column({ nullable: true }) subtitle: string;
  @Column({ name: 'link_url', nullable: true }) linkUrl: string;
  @Column({ name: 'sort_order', default: 0 }) sortOrder: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
