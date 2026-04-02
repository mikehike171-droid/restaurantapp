import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  findAll(): Promise<Role[]> {
    return this.roleRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: Partial<Role>): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { name: data.name } });
    if (existing) throw new ConflictException('Role name already exists');

    const role = this.roleRepo.create(data);
    return this.roleRepo.save(role);
  }

  async update(id: number, data: Partial<Role>): Promise<Role> {
    const role = await this.findOne(id);
    Object.assign(role, data);
    return this.roleRepo.save(role);
  }

  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepo.remove(role);
  }

  getPermissions() {
    return [
      { id: 'dashboard:view', label: 'View Dashboard', module: 'Dashboard' },
      { id: 'categories:manage', label: 'Manage Categories', module: 'Categories' },
      { id: 'menu:manage', label: 'Manage Menu', module: 'Menu' },
      { id: 'tables:manage', label: 'Manage Tables', module: 'Tables' },
      { id: 'locations:manage', label: 'Manage Locations', module: 'Locations' },
      { id: 'qr-codes:manage', label: 'Manage QR Codes', module: 'QR Codes' },
      { id: 'users:manage', label: 'Manage Users', module: 'Users' },
      { id: 'roles:manage', label: 'Manage Roles', module: 'Roles' },
    ];
  }
}
