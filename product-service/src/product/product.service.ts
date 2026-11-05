import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { ProductCacheService } from './product-cache.service.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly productCacheService: ProductCacheService,
  ) {}

  async create(dto: CreateProductDto) {
    const newProduct = this.productRepo.create(dto);
    const product = await this.productRepo.save(newProduct);
    await this.productCacheService.invalidateList();
    return product;
  }

  async findAll(page = 1, limit = 10) {
    const cachedProducts = await this.productCacheService.getList(page, limit);
    if (cachedProducts) return cachedProducts;
    const products = await this.productRepo.find({
      skip: (page - 1) * limit,
      take: limit,
    });
    await this.productCacheService.setList(page, limit, products);
    return products;
  }

  async findOne(id: string) {
    const cachedProduct = await this.productCacheService.getOne(id);
    if (cachedProduct) return cachedProduct;
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    await this.productCacheService.setOne(id, product);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product= await this.findOne(id)
    Object.assign(product, dto)
    const updated = await this.productRepo.save(product)
    await this.productCacheService.invalidateOne(id);
    await this.productCacheService.invalidateList();
    return updated;
  }

  async delete(id: string) {
    const product = await this.findOne(id)
    const deleted = await this.productRepo.remove(product)
    await this.productCacheService.invalidateOne(id);
    await this.productCacheService.invalidateList();
    return deleted;
  }
}
