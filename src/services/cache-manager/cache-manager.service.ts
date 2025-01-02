import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { MessageDto } from '../../modules/messages/dto/message.dto';

@Injectable()
export class CacheManagerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async set(key: string, value: unknown | MessageDto, ttl: number = 2000) {
    if (value instanceof MessageDto) {
      value = JSON.stringify(value);
    }

    await this.cacheManager.set(key, value, ttl);
  }

  async get(key: string) {
    const value = await this.cacheManager.get(key);

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (error) {
        return value;
      }
    }

    return null;
  }
}
