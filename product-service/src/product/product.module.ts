import { Module } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { ProductController } from './product.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { ProductCacheService } from './product-cache.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductService, ProductCacheService],
  controllers: [ProductController]
})
export class ProductModule {}
