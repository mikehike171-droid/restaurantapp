import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('pincode_demand')
export class PincodeDemand {
  @PrimaryGeneratedColumn() id: number;
  @Column({ length: 10 }) pincode: string;
  @Column({ name: 'customer_phone', nullable: true }) customerPhone: string;
  @Column({ name: 'customer_name', nullable: true }) customerName: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
