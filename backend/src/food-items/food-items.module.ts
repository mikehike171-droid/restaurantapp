import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodItem } from './food-item.entity';
import { FoodItemsService } from './food-items.service';
import { FoodItemsController } from './food-items.controller';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodItem]),
    CategoriesModule,
  ],
  controllers: [FoodItemsController],
  providers: [FoodItemsService],
  exports: [FoodItemsService, TypeOrmModule],
})
export class FoodItemsModule {}
