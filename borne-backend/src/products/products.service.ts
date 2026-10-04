import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';

/**
 * ProductsService handles business logic for products (menu items).
 * It talks directly to the database via TypeORM to create, read, update, or delete products.
 */
@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) { }

  findAll(): Promise<Product[]> {
    return this.productRepository.find({ relations: ['category'] });
  }

  findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id }, relations: ['category'] });
  }

  create(product: Partial<Product>): Promise<Product> {
    const newProduct = this.productRepository.create(product);
    return this.productRepository.save(newProduct);
  }

  async update(id: number, product: Partial<Product>): Promise<Product | null> {
    const updatePayload = { ...product };
    delete (updatePayload as any).name;
    delete (updatePayload as any).description;
    delete (updatePayload as any).category;
    
    await this.productRepository.update(id, updatePayload);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async findAllByLang(lang: string = 'fr', excludePages: boolean = false) {
    let products = await this.productRepository.find({ relations: ['category'] });
    
    if (excludePages) {
      products = products.filter(p => !p.category || p.category.TYPE?.toUpperCase() !== 'PAGE');
    }

    return products.map(p => {
      // Localize name
      let localizedName = p.name_fr || '';
      if (lang === 'fr' && p.name_fr) localizedName = p.name_fr;
      else if (lang === 'en' && p.name_en) localizedName = p.name_en;
      else if (lang === 'ar' && p.name_ar) localizedName = p.name_ar;

      // ✅ Get description based on language (no fallback to 'description')
      let localizedDescription: string | null = null;
      if (lang === 'fr') localizedDescription = p.description_fr;
      else if (lang === 'en') localizedDescription = p.description_en;
      else if (lang === 'ar') localizedDescription = p.description_ar;

      // Localize category name
      const category = p.category ? { ...p.category, name: p.category.FAMILLE || '' } : null;
      if (category) {
        if (lang === 'fr' && category.FAMILLE) category.name = category.FAMILLE;
        else if (lang === 'en' && category.FAMILLE_ANG) category.name = category.FAMILLE_ANG;
        else if (lang === 'ar' && category.FAMILLE_AR) category.name = category.FAMILLE_AR;
      }

      return {
        ...p,
        name: localizedName,
        description: localizedDescription, // This will be null if no description for that language
        category,
      };
    });
  }
}