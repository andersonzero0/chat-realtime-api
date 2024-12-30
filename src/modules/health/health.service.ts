import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { Kafka } from 'kafkajs';
import { createClient } from 'redis';
import {
  AwsConfig,
  RedisConfig,
  KafkaConfig,
  MongodbConfig,
} from '../../config/configuration';
import { PrismaService } from '../../services/prisma/prisma.service';
import { S3 } from '@aws-sdk/client-s3';

@Injectable()
export class HealthService {
  constructor(
    private healthService: HealthCheckService,
    private httpIndicator: HttpHealthIndicator,
    private prismaIndicator: PrismaHealthIndicator,
    private prismaClient: PrismaService,
    private configService: ConfigService,
  ) {}

  @HealthCheck({
    noCache: true,
  })
  async check() {
    try {
      const configMongo = this.configService.get<MongodbConfig>('mongodb');
      const configRedis = this.configService.get<RedisConfig>('redis');
      const configKafka = this.configService.get<KafkaConfig>('kafka');
      const configS3 = this.configService.get<AwsConfig>('aws')?.s3;

      if (!configKafka || !configS3 || !configMongo || !configRedis) {
        throw new Error('Database configuration not found');
      }

      const { accessKeyId, secretAccessKey, region, bucket } = configS3;

      const kafkaClient = new Kafka({
        brokers: [configKafka.broker],
      });

      const s3 = new S3({
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
        region,
        endpoint: configS3.endpoint,
        forcePathStyle: true,
      });

      const redisClient = createClient({
        url: configRedis.url,
        password: configRedis.password,
      });

      await redisClient.connect();
      await redisClient.disconnect();

      await s3.headBucket({ Bucket: bucket });

      const admin = kafkaClient.admin();
      await admin.connect();
      await admin.disconnect();

      return this.healthService.check([
        async () => this.httpIndicator.pingCheck('http', 'https://google.com'),
        async () =>
          this.prismaIndicator.pingCheck('MongoDB', this.prismaClient, {
            timeout: 2000,
          }),
      ]);
    } catch (error) {
      throw new Error(`Service health check failed: ${error.message}`);
    }
  }
}
