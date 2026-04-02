import { Controller, Get, Post, Patch, Put, Delete, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderDetailsDto } from './dto/order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Customer endpoint - place order
  @Post()
  @ApiOperation({ summary: 'Place a new order (customer)' })
  create(@Body() dto: CreateOrderDto) { return this.ordersService.createOrder(dto); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.ordersService.findById(id); }

  // Admin endpoints
  @Get('location/:locationId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', required: false })
  getByLocation(@Param('locationId', ParseIntPipe) locationId: number, @Query('status') status?: string) {
    return this.ordersService.getOrdersByLocation(locationId, status);
  }

  @Get('location/:locationId/live')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getLive(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.ordersService.getLiveOrders(locationId);
  }

  @Get('location/:locationId/tables')
  getTables(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.ordersService.getTablesByLocation(locationId);
  }

  @Post('location/:locationId/tables')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createTable(
    @Param('locationId', ParseIntPipe) locationId: number,
    @Body() body: { tableNumber: string; capacity: number }
  ) {
    return this.ordersService.createTable(locationId, body.tableNumber, body.capacity);
  }

  @Put('tables/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateTable(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { tableNumber: string; capacity: number }
  ) {
    return this.ordersService.updateTable(id, body.tableNumber, body.capacity);
  }

  @Delete('tables/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteTable(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.deleteTable(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (admin)' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }

  @Patch(':id/details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order customer details (admin)' })
  updateDetails(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateOrderDetailsDto) {
    return this.ordersService.updateDetails(id, dto);
  }

  @Get('history/:publicUserId')
  getHistory(@Param('publicUserId', ParseIntPipe) publicUserId: number) {
    return this.ordersService.getHistoryByPublicUser(publicUserId);
  }
}
