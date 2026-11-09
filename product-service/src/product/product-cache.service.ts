import { Inject, Injectable } from '@nestjs/common';
import { Product } from './entities/product.entity.js';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class ProductCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private async acquireLock(key: string, ttl = 5000): Promise<boolean> {
    try {
      const lockKey = `lock:${key}`;
      const existing = await this.cache.get<boolean>(lockKey);
      if (existing) return false;
      await this.cache.set(lockKey, true, ttl);
      return true;
    } catch {
      return false;
    }
  }

  private async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.cache.del(lockKey);
  }

  private async waitForLock<T>(
    key: string,
    maxWait = 3000,
  ): Promise<T | undefined> {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      const cachedValue = await this.cache.get<T>(key);
      if (cachedValue) return cachedValue;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  private async getVersion(): Promise<number> {
    try {
      const version = await this.cache.get<number>('products:version');
      return version ?? 1;
    } catch {
      return 1;
    }
  }

  async getList(page: number, limit: number): Promise<Product[] | undefined> {
    try {
      const version = await this.getVersion();
      const cacheKey = `products:v${version}page${page}:limit${limit}`;
      const cached = this.cache.get<Product[]>(cacheKey);

      if (cached) return cached;

      const getLock = await this.acquireLock(cacheKey);
      if (!getLock) {
        return await this.waitForLock<Product[]>(cacheKey);
      }
      return undefined;
    } catch {
      return undefined;
    }
  }

  async setList(
    page: number,
    limit: number,
    products: Product[],
  ): Promise<void> {
    const version = await this.getVersion();
    const cacheKey = `products:v${version}page${page}:limit${limit}`;
    await this.cache.set(cacheKey, products);
    await this.releaseLock(cacheKey);
  }

  async setOne(id: string, product: Product): Promise<void> {
    try {
      await this.cache.set(`products:${id}`, product);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Cache setOne failed:', error.message);
      }
    }
  }

  async getOne(id: string): Promise<Product | undefined> {
    try {
      return this.cache.get<Product>(`products:${id}`);
    } catch {
      return undefined;
    }
  }

  async invalidateOne(id: string): Promise<void> {
    try {
      await this.cache.del(`products:${id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Cache invalidateOne failed:', error.message);
      }
    }
  }

  async invalidateAllList(): Promise<void> {
    try {
      const version = await this.getVersion();
      await this.cache.set(`products:version`, version + 1, 0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Cache invalidateAllList failed:', error.message);
      }
    }
  }
}
