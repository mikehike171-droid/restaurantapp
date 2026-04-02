import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsDateString, IsEnum } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  promoCode: string;

  @ApiProperty()
  @IsNumber()
  minAmount: number;

  @ApiProperty()
  @IsNumber()
  discountAmount: number;

  @ApiPropertyOptional({ enum: ['fixed', 'percentage'], default: 'fixed' })
  @IsEnum(['fixed', 'percentage'])
  @IsOptional()
  type: string = 'fixed';

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expiryDate?: Date;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}

export class UpdateOfferDto extends CreateOfferDto {}
