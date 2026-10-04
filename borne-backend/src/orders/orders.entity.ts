import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { User } from '../users/user.entity';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  // Relation vers l'utilisateur (facultatif pour les commandes bornes)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ name: 'total', type: 'decimal', precision: 10, scale: 2 })
  total!: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items!: OrderItem[];
}