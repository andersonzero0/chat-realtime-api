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
import { AwsConfig, DatabaseConfig } from '../../config/configuration';
import { PrismaService } from '../../services/prisma/prisma.service';

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
      const configDatabase = this.configService.get<DatabaseConfig>('database');
      const configS3 = this.configService.get<AwsConfig>('aws')?.s3;

      if (!configDatabase || !configS3) {
        throw new Error('Database configuration not found');
      }

      //const { accessKeyId, secretAccessKey, region, bucket } = configS3;

      const kafkaClient = new Kafka({
        brokers: [configDatabase.kafka.broker],
      });
      // const s3 = new S3({
      //   credentials: {
      //     accessKeyId,
      //     secretAccessKey,
      //   },
      //   region,
      // });

      const redisClient = createClient({
        url: configDatabase.redis.url,
        password: configDatabase.redis.password,
      });

      await redisClient.connect();
      await redisClient.disconnect();

      //await s3.headBucket({ Bucket: bucket });

      const admin = kafkaClient.admin();
      await admin.connect();
      await admin.disconnect();

      return this.healthService.check([
        async () => this.httpIndicator.pingCheck('http', 'https://google.com'),
        async () =>
          this.prismaIndicator.pingCheck('database', this.prismaClient, {
            timeout: 2000,
          }),
      ]);
    } catch (error) {
      console.error(error);
      throw new Error(`Service health check failed: ${error.message}`);
    }
  }
}
