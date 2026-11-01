import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  create(dto: CreateProductDto) {
    const newProduct = this.productRepo.create(dto);
    return this.productRepo.save(newProduct);
  }

  findAll(page = 1, limit = 10) {
    return this.productRepo.find({
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product= await this.findOne(id)
    Object.assign(product, dto)
    return this.productRepo.save(product)
  }

  async delete(id: string) {
    const product = await this.findOne(id)
    return this.productRepo.remove(product)
  }
}
