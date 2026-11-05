import { Inject, Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity.js';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProductCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async getList(page: number, limit: number): Promise<Product[] | undefined> {
    return this.cache.get<Product[]>(`products:page${page}:limit${limit}`);
  }

  async setList(
    page: number,
    limit: number,
    products: Product[],
  ) {
    await this.cache.set(`products:page${page}:limit${limit}`, products);
  }

  async getOne(id: string): Promise<Product | undefined> {
    return this.cache.get<Product>(`product:${id}`);
  }

  async setOne(id: string, product: Product) {
    await this.cache.set(`product:${id}`, product);
  }

  async invalidateOne(id: string): Promise<void> {
    await this.cache.del(`product:${id}`);
  }

  async invalidateList(): Promise<void> {
    const keys: string[] = await (this.cache as any).store.keys('products:*');
    for (const key of keys) {
      await this.cache.del(key);
    }
  }
}
