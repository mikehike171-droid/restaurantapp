import { IsString, IsUUID, IsOptional, IsNumber, IsBoolean, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePincodeDto {
  @ApiProperty({ example: '500032' })
  @IsString() @Length(6, 10) @Matches(/^\d+$/, { message: 'Pincode must be numeric' })
  pincode: string;

  @ApiProperty({ example: 'Gachibowli' })
  @IsString() areaName: string;

  @ApiProperty() @IsNumber() locationId: number;

  @ApiProperty({ required: false }) @IsOptional() @IsNumber() deliveryCharge?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() minOrderAmount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() estimatedDeliveryTime?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdatePincodeDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() areaName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() locationId?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() deliveryCharge?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() minOrderAmount?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() estimatedDeliveryTime?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class NotifyDemandDto {
  @ApiProperty() @IsString() @Length(6, 10) pincode: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerName?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerPhone?: string;
}
