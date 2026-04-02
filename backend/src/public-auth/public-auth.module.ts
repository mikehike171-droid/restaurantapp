import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PublicUser } from '../public-users/public-user.entity';
import { ReferralCoupon } from '../public-users/referral-coupon.entity';
import { PublicAuthService } from './public-auth.service';
import { PublicAuthController } from './public-auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublicUser, ReferralCoupon]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET', 'restaurant-secret-key'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [PublicAuthController],
  providers: [PublicAuthService],
  exports: [PublicAuthService],
})
export class PublicAuthModule {}
