import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { OrderItem } from './order-item.entity';
import { Product } from '../products/products.entity';

/**
 * OrdersService is responsible for managing the checkout process.
 * It ties products to orders, totals prices, and manages stock quantities.
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  // Retourne toutes les commandes avec leurs items et produits liés
  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product', 'user'],
    });
  }

  // Crée une nouvelle commande en liant l'utilisateur
  async create(
    items: { productId: number; quantity: number; selectedOptions?: string }[],
    userId?: number,
  ): Promise<Order> {
    if (!items || items.length === 0) {
      throw new Error('items must be a non-empty array');
    }

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const i of items) {
      const product = await this.productRepository.findOne({ where: { id: i.productId } });
      if (!product) continue;

      total += Number(product.price) * i.quantity;

      const orderItem = this.orderItemRepository.create({
        product,
        quantity: i.quantity,
        selectedOptions: i.selectedOptions,
      });

      orderItems.push(orderItem);
    }

    const order = this.orderRepository.create({
      total,
      items: orderItems,
      ...(userId ? { user: { ID: userId } as any } : {}),
    });

    return this.orderRepository.save(order);
  }
}