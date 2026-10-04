import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CategoriesService } from './categories.service';
import { Category } from './categories.entity';

/**
 * CategoriesController handles HTTP requests for product categories (e.g., Burgers, Drinks).
 * Modifying categories (Post, Patch, Delete) requires authentication (JwtAuthGuard).
 * Fetching categories (Get) is open to the public.
 */
@Controller('categories')
export class CategoriesController {

  constructor(private readonly categoriesService: CategoriesService) { }

  @Get()
  getAll(@Query('lang') lang: string = 'fr', @Query('excludePages') excludePages?: string): Promise<any[]> {
    return this.categoriesService.findAllByLang(lang, excludePages === 'true');
  }

  @Get('pages/by-names')
  getByNames(@Query('names') names: string, @Query('lang') lang: string = 'fr') {
    const namesArray = names ? names.split(',').map(n => n.trim()) : [];
    if (namesArray.length === 0) return [];
    return this.categoriesService.findByNamesWithProducts(namesArray, lang);
  }

  @Get(':id')
  getOne(@Param('id') id: number): Promise<Category | null> {
    return this.categoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() category: Partial<Category>): Promise<Category> {
    return this.categoriesService.create(category);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: number, @Body() category: Partial<Category>): Promise<Category | null> {
    return this.categoriesService.update(id, category);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.categoriesService.remove(id);
  }
}
