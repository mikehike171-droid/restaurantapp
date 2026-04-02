import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeSlider } from './home-slider.entity';
import { HomeSlidersService } from './home-sliders.service';
import { HomeSlidersController } from './home-sliders.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HomeSlider])],
  controllers: [HomeSlidersController],
  providers: [HomeSlidersService],
  exports: [HomeSlidersService],
})
export class HomeSlidersModule {}
