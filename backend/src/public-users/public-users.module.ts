import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicUser } from './public-user.entity';
import { ReferralCoupon } from './referral-coupon.entity';
import { PublicUsersService } from './public-users.service';
import { PublicUsersController } from './public-users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublicUser, ReferralCoupon]),
    AuthModule,
  ],
  controllers: [PublicUsersController],
  providers: [PublicUsersService],
  exports: [PublicUsersService],
})
export class PublicUsersModule {}
