import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisLockService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async acquireLock(key: string, ttl = 5000): Promise<boolean> {
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

  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.cache.del(lockKey);
  }

  async waitForLock<T>(key: string, maxWait = 3000): Promise<T | undefined> {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      const cachedValue = await this.cache.get<T>(key);
      if (cachedValue) return cachedValue;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
