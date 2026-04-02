import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FoodItemsService } from './food-items.service';
import { CreateFoodItemDto, UpdateFoodItemDto } from './dto/food-item.dto';

@ApiTags('Food Items')
@Controller('food-items')
export class FoodItemsController {
  constructor(private readonly foodItemsService: FoodItemsService) {}

  @Get('menu/:locationId')
  @ApiOperation({ summary: 'Get full menu grouped by category (for customer)' })
  getMenu(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.foodItemsService.getMenuByLocation(locationId);
  }

  @Get('location/:locationId')
  @ApiQuery({ name: 'categoryId', required: false })
  getByLocation(@Param('locationId', ParseIntPipe) locationId: number, @Query('categoryId') categoryId?: string) {
    if (categoryId) return this.foodItemsService.getByLocationAndCategory(locationId, parseInt(categoryId));
    return this.foodItemsService.findAllByLocation(locationId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.foodItemsService.findById(id); }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateFoodItemDto) { return this.foodItemsService.create(dto); }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFoodItemDto) {
    return this.foodItemsService.update(id, dto);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggle(@Param('id', ParseIntPipe) id: number) { return this.foodItemsService.toggleAvailability(id); }

  @Patch(':id/toggle-visibility')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  toggleVisibility(@Param('id', ParseIntPipe) id: number) { return this.foodItemsService.toggleActive(id); }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  delete(@Param('id', ParseIntPipe) id: number) { return this.foodItemsService.delete(id); }
}
