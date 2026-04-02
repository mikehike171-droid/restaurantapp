import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminUser } from './admin-user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(AdminUser)
    private readonly userRepo: Repository<AdminUser>,
  ) {}

  async findAll(): Promise<AdminUser[]> {
    return this.userRepo.find({
      select: ['id', 'name', 'email', 'role', 'locationIds', 'isActive', 'createdAt'],
    });
  }

  async findOne(id: number): Promise<AdminUser> {
    const user = await this.userRepo.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: any): Promise<AdminUser> {
    const existing = await this.userRepo.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = this.userRepo.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      locationIds: data.locationIds || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
    });
    return this.userRepo.save(user);
  }

  async update(id: number, data: any): Promise<AdminUser> {
    const user = await this.findOne(id);
    
    if (data.password) {
      user.passwordHash = await bcrypt.hash(data.password, 10);
    }
    
    if (data.name) user.name = data.name;
    if (data.email) user.email = data.email;
    if (data.role) user.role = data.role;
    if (data.locationIds !== undefined) user.locationIds = data.locationIds;
    if (data.isActive !== undefined) user.isActive = data.isActive;

    return this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepo.remove(user);
  }
}
