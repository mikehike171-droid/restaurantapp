import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHomeSliderDto {
  @ApiProperty() @IsString() imageUrl: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() title?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() subtitle?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() linkUrl?: string;
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() sortOrder?: number;
}

export class UpdateHomeSliderDto {
  @ApiProperty({ required: false }) @IsString() @IsOptional() imageUrl?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() title?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() subtitle?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() linkUrl?: string;
  @ApiProperty({ required: false }) @IsNumber() @IsOptional() sortOrder?: number;
  @ApiProperty({ required: false }) @IsBoolean() @IsOptional() isActive?: boolean;
}
