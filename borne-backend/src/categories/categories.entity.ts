import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from '../products/products.entity';

@Entity('TABLE_FAMILLES')
export class Category {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number;

  @Column()
  FAMILLE: string;

  @Column({ nullable: true })
  TYPE: string;

  @Column({ nullable: true })
  FAMILLE_AR: string;

  @Column({ nullable: true })
  FAMILLE_ANG: string;

  @Column({ name: 'IMAGE', nullable: true })
  image: string;

  @OneToMany(() => Product, product => product.category)
  products: Product[];
}