import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, In } from 'typeorm';
import { FoodItemsService } from '../food-items/food-items.service';
import { Order, OrderStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { RestaurantTable } from './table.entity';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderDetailsDto } from './dto/order.dto';
import { PublicUser } from '../public-users/public-user.entity';
import { ReferralCoupon } from '../public-users/referral-coupon.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem) private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(RestaurantTable) private readonly tableRepo: Repository<RestaurantTable>,
    @InjectRepository(PublicUser) private readonly publicUserRepo: Repository<PublicUser>,
    @InjectRepository(ReferralCoupon) private readonly referralCouponRepo: Repository<ReferralCoupon>,
    private readonly foodItemsService: FoodItemsService,
    private readonly dataSource: DataSource,
  ) {}

  private generateOrderNumber(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate table (if provided)
      if (dto.tableId) {
        const table = await this.tableRepo.findOne({ where: { id: dto.tableId, locationId: dto.locationId } });
        if (!table) throw new BadRequestException('Table not found at this location');
      }

      // Calculate totals
      let totalAmount = 0;
      const orderItemsData: Partial<OrderItem>[] = [];

      for (const item of dto.items) {
        const foodItem = await this.foodItemsService.findById(item.foodItemId);
        if (!foodItem.isAvailable) throw new BadRequestException(`${foodItem.name} is not available`);
        const totalPrice = Number(foodItem.price) * item.quantity;
        totalAmount += totalPrice;
        orderItemsData.push({
          foodItemId: item.foodItemId,
          quantity: item.quantity,
          unitPrice: Number(foodItem.price),
          totalPrice,
          specialInstructions: item.specialInstructions,
          status: 'pending',
        });
      }

      // Create order
      const order = queryRunner.manager.create(Order, {
        orderNumber: this.generateOrderNumber(),
        locationId: dto.locationId,
        tableId: dto.tableId,
        publicUserId: dto.publicUserId,
        appliedOfferId: dto.appliedOfferId,
        discountAmount: dto.discountAmount || 0,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerAddress: dto.customerAddress,
        notes: dto.notes,
        totalAmount: totalAmount - (dto.discountAmount || 0),
        status: OrderStatus.PENDING,
      });
      const savedOrder = await queryRunner.manager.save(Order, order);

      // Save items
      const items = orderItemsData.map(item => queryRunner.manager.create(OrderItem, { ...item, orderId: savedOrder.id }));
      await queryRunner.manager.save(OrderItem, items);

      // Mark table occupied (if provided)
      if (dto.tableId) {
        await queryRunner.manager.update(RestaurantTable, dto.tableId, { isAvailable: false });
      }

      // Handle Referral Coupon Usage
      if (dto.appliedReferralCouponId) {
        await queryRunner.manager.update(ReferralCoupon, dto.appliedReferralCouponId, { isUsed: true });
      }

      await queryRunner.commitTransaction();

      // IF THIS IS THE USER'S FIRST ORDER, AND THEY WERE REFERRED, REWARD THE REFERRER
      if (dto.publicUserId) {
        const orderCount = await this.orderRepo.count({ where: { publicUserId: dto.publicUserId } });
        if (orderCount === 1) { // This is the first order (just saved)
          const user = await this.publicUserRepo.findOne({ where: { id: dto.publicUserId } });
          if (user && user.referredById) {
            // Create a reward for the referrer
            const couponCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const reward = this.referralCouponRepo.create({
              publicUserId: user.referredById,
              referredUserId: user.id,
              amount: 100,
              code: couponCode,
            });
            await this.referralCouponRepo.save(reward);
          }
        }
      }

      return this.findById(savedOrder.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: number): Promise<Order> {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['location', 'table', 'items', 'items.foodItem'],
    });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  async getOrdersByLocation(locationId: number, status?: string): Promise<Order[]> {
    const query = this.orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.foodItem', 'foodItem')
      .leftJoinAndSelect('order.publicUser', 'publicUser')
      .where('order.locationId = :locationId', { locationId });

    if (status) query.andWhere('order.status = :status', { status });

    return query.orderBy('order.createdAt', 'DESC').getMany();
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    console.log(`[OrdersService] Updating order ${id} to status: ${dto.status}`);
    
    // Use raw update to ensure DB hit
    await this.orderRepo.createQueryBuilder()
      .update(Order)
      .set({ status: dto.status })
      .where("id = :id", { id })
      .execute();

    const order = await this.findById(id);
    console.log(`[OrdersService] Refetched order status: ${order.status}`);

    // Free table if order is completed or cancelled (if order has a table)
    if ([OrderStatus.COMPLETED, OrderStatus.CANCELLED].includes(dto.status) && order.tableId) {
      await this.tableRepo.update(order.tableId, { isAvailable: true });
    }
    return order;
  }

  async getTablesByLocation(locationId: number): Promise<RestaurantTable[]> {
    return this.tableRepo.find({ where: { locationId }, order: { tableNumber: 'ASC' } });
  }

  async createTable(locationId: number, tableNumber: string, capacity: number): Promise<RestaurantTable> {
    const table = this.tableRepo.create({ locationId, tableNumber, capacity });
    return this.tableRepo.save(table);
  }

  async updateTable(id: number, tableNumber: string, capacity: number): Promise<RestaurantTable> {
    await this.tableRepo.update(id, { tableNumber, capacity });
    const table = await this.tableRepo.findOne({ where: { id } });
    if (!table) throw new NotFoundException(`Table ${id} not found`);
    return table;
  }

  async deleteTable(id: number): Promise<void> {
    const table = await this.tableRepo.findOne({ where: { id } });
    if (!table) throw new NotFoundException(`Table ${id} not found`);
    await this.tableRepo.delete(id);
  }

  async getHistoryByPublicUser(publicUserId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { publicUserId },
      relations: ['items', 'items.foodItem', 'table'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLiveOrders(locationId: number) {
    return this.orderRepo.find({
      where: [
        { locationId, status: Not(In([OrderStatus.COMPLETED, OrderStatus.CANCELLED])) }
      ],
      relations: ['table', 'items', 'items.foodItem', 'publicUser'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateDetails(id: number, dto: UpdateOrderDetailsDto): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException(`Order ${id} not found`);

    if (dto.customerName !== undefined) order.customerName = dto.customerName;
    if (dto.customerPhone !== undefined) order.customerPhone = dto.customerPhone;
    if (dto.customerAddress !== undefined) order.customerAddress = dto.customerAddress;

    return this.orderRepo.save(order);
  }
}
