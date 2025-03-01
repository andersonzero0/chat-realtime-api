import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { BullModule } from '@nestjs/bullmq';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../../config/configuration';
import { MessagesConsumer } from './messages.consumer';
import { PrismaModule } from '../../services/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ChatModule } from '../chat/chat.module';
import { S3Module } from '../../services/s3/s3.module';
import { RedisModule } from '../../services/redis/redis.module';
import { KafkaModule } from '../../services/kafka/kafka.module';
import { ProjectsService } from '../projects/projects.service';
import { CacheManagerModule } from '../../services/cache-manager/cache-manager.module';
import { MessagesCache } from './messages.cache';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ChatModule,
    S3Module,
    RedisModule,
    KafkaModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const configRedis = configService.get<RedisConfig>('redis');

        if (!configRedis) {
          throw new Error('Redis credentials not found');
        }

        return {
          connection: {
            url: configRedis.url,
            password: configRedis.password,
          },
        };
      },
    }),
    MulterModule.register({
      dest: './uploads',
      storage: multer.memoryStorage(),
    }),
    CacheManagerModule,
  ],
  providers: [
    MessagesService,
    ProjectsService,
    MessagesConsumer,
    MessagesCache,
  ],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
