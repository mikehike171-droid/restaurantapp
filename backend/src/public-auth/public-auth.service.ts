import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PublicUser } from '../public-users/public-user.entity';
import { RegisterDto, LoginDto } from './dto/public-auth.dto';

@Injectable()
export class PublicAuthService implements OnModuleInit {
  constructor(
    @InjectRepository(PublicUser) private readonly userRepo: Repository<PublicUser>,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    // Backfill referral codes for existing users
    const users = await this.userRepo.find();
    for (const user of users) {
      if (!user.referralCode) {
        user.referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        await this.userRepo.save(user);
      }
    }
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    let referredBy = null;
    if (dto.referralByCode) {
      referredBy = await this.userRepo.findOne({ where: { referralCode: dto.referralByCode.toUpperCase() } });
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    // Generate unique referral code
    let referralCode = '';
    let isUnique = false;
    while (!isUnique) {
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const check = await this.userRepo.findOne({ where: { referralCode } });
      if (!check) isUnique = true;
    }

    const user = this.userRepo.create({
      ...dto,
      password: passwordHash,
      referralCode,
      referredById: referredBy?.id,
    });
    const saved = await this.userRepo.save(user);
    
    return this.login({ email: dto.email, password: dto.password });
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: dto.email })
      .getOne();

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, type: 'public' };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    };
  }
}
