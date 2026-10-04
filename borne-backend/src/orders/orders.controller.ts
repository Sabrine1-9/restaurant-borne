import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './orders.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';

/**
 * OrdersController handles the receipt and fetching of customer orders.
 */
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Req() req): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req,
  ): Promise<Order> {
    // Si l'utilisateur est connecté (Admin), on lie son ID. 
    // Sinon (Borne), l'ID sera undefined.
    const userId = req.user?.ID; 
    return this.ordersService.create(createOrderDto.items, userId);
  }
}