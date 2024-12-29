import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { Logger, ValidationPipe } from '@nestjs/common';
import { RedisIoAdapter } from './services/redis/redis.adapter';
import { HealthService } from './modules/health/health.service';

async function bootstrap() {
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const healthService = app.get<HealthService>(HealthService);

  try {
    await healthService.check();
    logger.log('Health check passed');
  } catch (error) {
    logger.error('Health check failed: ', error);
    process.exit(1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });

  // implement redisIoAdapter
  const redisIoAdapter = new RedisIoAdapter(app, configService);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const config = new DocumentBuilder()
    .setTitle('Chat API')
    .setVersion('1.0')
    .addTag('Chat', 'Operações relacionadas ao chat')
    .addServer('http://localhost:3000', 'Local')
    //.addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  const port = configService.get<number>('port');
  await app.listen(port || 3000);
  logger.log(
    `Application is running on: ${await app.getUrl()} | ${process.env.NODE_ENV || 'development'}`,
  );
}
bootstrap();
