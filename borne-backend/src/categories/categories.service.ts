import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './categories.entity';

/**
 * CategoriesService retrieves and modifies categories in the database.
 * It is called by CategoriesController to execute SQL queries.
 */
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['products'] });
  }

  findOne(id: number): Promise<Category | null> {
    return this.categoryRepository.findOne({ where: { id }, relations: ['products'] });
  }

  create(category: Partial<Category>): Promise<Category> {
    const newCategory = this.categoryRepository.create(category);
    return this.categoryRepository.save(newCategory);
  }

  async update(id: number, category: Partial<Category>): Promise<Category | null> {
    const updatePayload = { ...category };
    delete (updatePayload as any).name;
    delete (updatePayload as any).products;
    
    await this.categoryRepository.update(id, updatePayload);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }

  async findAllByLang(lang: string = 'fr', excludePages: boolean = false) {
    let categories = await this.categoryRepository.find();
    
    if (excludePages) {
      categories = categories.filter(c => c.TYPE?.toUpperCase() !== 'PAGE');
    }

    return categories.map(c => {
      let localizedName = c.FAMILLE || '';
      if (lang === 'fr' && c.FAMILLE) localizedName = c.FAMILLE;
      else if (lang === 'en' && c.FAMILLE_ANG) localizedName = c.FAMILLE_ANG;
      else if (lang === 'ar' && c.FAMILLE_AR) localizedName = c.FAMILLE_AR;

      return {
        ...c,
        name: localizedName,
      };
    });
  }

  async findByNamesWithProducts(names: string[], lang: string = 'fr') {
    const categories = await this.categoryRepository.find({
      where: { FAMILLE: In(names) },
      relations: ['products'],
    });

    return categories.map(c => {
      let localizedName = c.FAMILLE || '';
      if (lang === 'fr' && c.FAMILLE) localizedName = c.FAMILLE;
      else if (lang === 'en' && c.FAMILLE_ANG) localizedName = c.FAMILLE_ANG;
      else if (lang === 'ar' && c.FAMILLE_AR) localizedName = c.FAMILLE_AR;

      return {
        ...c,
        name: localizedName,
        products: c.products ? c.products.map(p => {
          let pLocalizedName = p.name_fr || '';
          if (lang === 'fr' && p.name_fr) pLocalizedName = p.name_fr;
          else if (lang === 'en' && p.name_en) pLocalizedName = p.name_en;
          else if (lang === 'ar' && p.name_ar) pLocalizedName = p.name_ar;

          let pLocalizedDesc: string | null = null;
          if (lang === 'fr') pLocalizedDesc = p.description_fr;
          else if (lang === 'en') pLocalizedDesc = p.description_en;
          else if (lang === 'ar') pLocalizedDesc = p.description_ar;

          return {
            ...p,
            name: pLocalizedName,
            description: pLocalizedDesc,
          };
        }) : []
      };
    });
  }

}
