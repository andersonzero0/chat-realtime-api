import { Module } from '@nestjs/common';
import { CacheManagerService } from './cache-manager.service';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../../config/configuration';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const configRedis = configService.getOrThrow<RedisConfig>('redis');

        const store = await redisStore({
          socket: {
            host: configRedis.host,
            port: configRedis.port,
          },
          password: configRedis.password,
        });

        return {
          store: store as unknown as CacheStore,
          //ttl: 2000,
        };
      },
    }),
  ],
  providers: [CacheManagerService],
  exports: [CacheManagerService],
})
export class CacheManagerModule {}
