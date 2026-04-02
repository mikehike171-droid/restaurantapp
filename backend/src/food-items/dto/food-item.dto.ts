import { IsString, IsUUID, IsNumber, IsBoolean, IsOptional, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFoodItemDto {
  @ApiProperty() @IsNumber() locationId: number;
  @ApiProperty() @IsNumber() categoryId: number;
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() @IsPositive() price: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() imageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isVeg?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() preparationTime?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() sortOrder?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() rating?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() discountText?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isAvailable?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}

export class UpdateFoodItemDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsNumber() @IsPositive() price?: number;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsBoolean() isVeg?: boolean;
  @IsOptional() @IsBoolean() isAvailable?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsNumber() preparationTime?: number;
  @IsOptional() @IsNumber() categoryId?: number;
  @IsOptional() @IsNumber() rating?: number;
  @IsOptional() @IsString() discountText?: string;
}
