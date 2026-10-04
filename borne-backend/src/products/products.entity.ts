import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../categories/categories.entity';

@Entity('TABLE_ARTICLES')
export class Product {
  @PrimaryGeneratedColumn({ name: 'ID' })
  id: number; // id auto-increment



  @Column({ name: 'Article' })
  name_fr: string;

  @Column({ name: 'ARTICLE_ANG', nullable: true })
  name_en: string;

  @Column({ name: 'ARTICLE_AR', nullable: true })
  name_ar: string;



  @Column({ name: 'Description', type: 'text', nullable: true })
  description_fr: string;

  @Column({ name: 'DESCRIPTION_ANG', type: 'text', nullable: true })
  description_en: string;

  @Column({ name: 'DESCRIPTION_AR', type: 'text', nullable: true })
  description_ar: string;

  @Column({ name: 'PRIX_A', type: 'decimal', precision: 18, scale: 3 })
  price: number;

  @Column({ name: 'Images', nullable: true })
  image: string;

  @Column({ name: 'PAGES', nullable: true })
  pages: string;

  @ManyToOne(() => Category, category => category.products)
  @JoinColumn({ name: 'Famille', referencedColumnName: 'FAMILLE' })
  category: Category;
}