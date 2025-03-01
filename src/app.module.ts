import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/env.validation';
import { PrismaModule } from './services/prisma/prisma.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './services/mail/mail.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ChatModule } from './modules/chat/chat.module';
import { S3Module } from './services/s3/s3.module';
import { RedisModule } from './services/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { KafkaModule } from './services/kafka/kafka.module';
import {
  makeCounterProvider,
  makeGaugeProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { MetricsMiddleware } from './middlewares/metrics.middleware';
import { CacheManagerModule } from './services/cache-manager/cache-manager.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env`,
      load: [configuration],
      validate,
      isGlobal: true,
      expandVariables: true,
    }),
    PrismaModule,
    ProjectsModule,
    AuthModule,
    MailModule,
    MessagesModule,
    ChatModule,
    S3Module,
    RedisModule,
    HealthModule,
    KafkaModule,
    PrometheusModule.register({
      path: '/metrics',
    }),
    CacheManagerModule,
  ],
  providers: [
    makeCounterProvider({
      name: 'count',
      help: 'metric_help',
      labelNames: ['method', 'origin'] as string[],
    }),
    makeGaugeProvider({
      name: 'gauge',
      help: 'metric_help',
    }),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
