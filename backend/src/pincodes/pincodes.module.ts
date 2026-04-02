import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Pincode } from './pincode.entity';
import { PincodeDemand } from './pincode-demand.entity';
import { PincodesService } from './pincodes.service';
import { PincodesController } from './pincodes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Pincode, PincodeDemand]), HttpModule],
  providers: [PincodesService],
  controllers: [PincodesController],
  exports: [PincodesService],
})
export class PincodesModule {}
