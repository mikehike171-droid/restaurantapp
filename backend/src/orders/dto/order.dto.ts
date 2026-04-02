import { IsString, IsUUID, IsArray, IsOptional, IsNumber, IsPositive, ValidateNested, IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../order.entity';

export class OrderItemDto {
  @ApiProperty() @IsNumber() foodItemId: number;
  @ApiProperty() @IsNumber() @IsPositive() quantity: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() specialInstructions?: string;
}

export class CreateOrderDto {
  @ApiProperty() @IsNumber() locationId: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() tableId?: number;
  
  @ApiProperty({ required: false })
  @ValidateIf(o => !o.tableId)
  @IsNotEmpty({ message: 'Customer name is required for delivery' })
  @IsString()
  customerName?: string;

  @ApiProperty({ required: false })
  @ValidateIf(o => !o.tableId)
  @IsNotEmpty({ message: 'Customer phone is required for delivery' })
  @IsString()
  customerPhone?: string;

  @ApiProperty({ required: false })
  @ValidateIf(o => !o.tableId)
  @IsNotEmpty({ message: 'Customer address is required for delivery' })
  @IsString()
  customerAddress?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() publicUserId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() discountAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() appliedOfferId?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() appliedReferralCouponId?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class UpdateOrderDetailsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() customerName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() customerAddress?: string;
}
