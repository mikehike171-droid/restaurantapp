import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PublicUser } from './public-user.entity';
import { ReferralCoupon } from './referral-coupon.entity';

@Injectable()
export class PublicUsersService {
  constructor(
    @InjectRepository(PublicUser) private readonly userRepo: Repository<PublicUser>,
    @InjectRepository(ReferralCoupon) private readonly couponRepo: Repository<ReferralCoupon>,
  ) {}

  async getMe(id: any) {
    const user = await this.userRepo.findOne({ where: { id: Number(id) } });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      referralCode: user.referralCode,
    };
  }

  async getCoupons(userId: number) {
    return this.couponRepo.find({
      where: { publicUserId: userId, isUsed: false },
      order: { createdAt: 'DESC' },
    });
  }
}
