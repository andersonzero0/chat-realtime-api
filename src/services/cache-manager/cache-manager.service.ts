import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheManagerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: unknown) {
    await this.cacheManager.set(key, value);
  }

  async get<ReturnType>(key: string) {
    const value = await this.cacheManager.get<ReturnType>(key);
    return value;
  }
}
