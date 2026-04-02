import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodItemsModule } from '../food-items/food-items.module';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { RestaurantTable } from './table.entity';
import { PublicUser } from '../public-users/public-user.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

import { ReferralCoupon } from '../public-users/referral-coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, RestaurantTable, PublicUser, ReferralCoupon]),
    FoodItemsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
