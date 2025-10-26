import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    createProductDto: CreateProductDto
  ) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true }))
    paginationDto: PaginationDto,
    @Query('category') category?: string,
    @Query('search') search?: string
  ) {
    return await this.productsService.findAll(
      paginationDto.page,
      paginationDto.limit,
      category,
      search
    );
  }

  @Get('categories')
  async getCategories() {
    const categories = await this.productsService.getCategories();
    return { categories };
  }

  @Get('category/:category')
  async findByCategory(@Param('category') category: string) {
    const products = await this.productsService.findByCategory(category);
    return { products };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.productsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateProductDto: UpdateProductDto
  ) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Put(':id/stock')
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number
  ) {
    return await this.productsService.updateStock(id, quantity);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.productsService.remove(id);
    return { message: `Product with ID ${id} has been deleted` };
  }
}
