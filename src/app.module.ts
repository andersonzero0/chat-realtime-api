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
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthService } from './modules/auth/auth.service';

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
    GraphQLModule.forRootAsync({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [AuthService],
      useFactory: (authService: AuthService) => ({
        playground: false,
        autoSchemaFile: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        subscriptions: {
          'graphql-ws': {
            onConnect: async (ctx) => {
              const { connectionParams } = ctx;

              const auth = connectionParams.Authorization;

              if (!auth) {
                return false;
              }

              const [type, token] = auth.split(' ');

              if (type !== 'Bearer' || !token) {
                return false;
              }

              const payload = await authService.verifyUser(token);

              if (!payload) {
                return false;
              }

              const project_id = payload.id.split('_')[0];
              const user_id = payload.id.split('_')[1];

              ctx.connectionParams.project_id = project_id;
              ctx.connectionParams.user_id = user_id;
            },
          },
        },
      }),
    }),
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

/**
 * driver: ApolloDriver,
        playground: false,
        autoSchemaFile: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
        subscriptions: {
          'graphql-ws': {
            onConnect: async (ctx: any) => {
              console.log('onConnect', ctx);
              return ctx;
            },
          },
        },
 */
