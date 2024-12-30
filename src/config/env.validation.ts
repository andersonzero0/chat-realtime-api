import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @IsNotEmpty()
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  HOST!: string;

  @IsString()
  @IsNotEmpty()
  NODE_ENV!: string;

  @IsString()
  @IsNotEmpty()
  APP_NAME!: string;

  @IsString()
  @IsNotEmpty()
  DB_CONNECTION!: string;

  @IsString()
  @IsNotEmpty()
  CONTAINER_NAME!: string;

  @IsString()
  @IsNotEmpty()
  CONTAINER_TIMEZONE!: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_HOST!: string;

  @IsNumber()
  @IsNotEmpty()
  MONGODB_PORT!: number;

  @IsString()
  @IsNotEmpty()
  MONGODB_USER!: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  MONGODB_DB_NAME!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_VERSION!: string;

  @IsNumber()
  @IsNotEmpty()
  REDIS_PORT!: number;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_HOST!: string;

  @IsString()
  @IsNotEmpty()
  KAFKA_VERSION!: string;

  @IsNumber()
  @IsNotEmpty()
  KAFKA_CLIENT_PORT!: number;

  @IsNumber()
  @IsNotEmpty()
  KAFKA_EXTERNAL_PORT!: number;

  @IsNumber()
  @IsNotEmpty()
  KAFKA_BROKER_ID!: number;

  @IsNumber()
  @IsNotEmpty()
  KAFKA_NUM_PARTITIONS!: number;

  @IsString()
  @IsNotEmpty()
  KAFKA_BROKER!: string;

  @IsString()
  @IsNotEmpty()
  ZOOKEEPER_VERSION!: string;

  @IsNumber()
  @IsNotEmpty()
  ZOOKEEPER_PORT!: number;

  @IsNumber()
  @IsNotEmpty()
  KAFKA_UI_PORT!: number;

  @IsString()
  @IsNotEmpty()
  EMAIL_RESEND_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_USER!: string;

  @IsString()
  @IsNotEmpty()
  MINIO_ROOT_USER!: string;

  @IsString()
  @IsNotEmpty()
  MINIO_ROOT_PASSWORD!: string;

  @IsNumber()
  @IsNotEmpty()
  FORWARD_MINIO_PORT!: number;

  @IsNumber()
  @IsNotEmpty()
  FORWARD_MINIO_CONSOLE_PORT!: number;

  @IsString()
  @IsNotEmpty()
  AWS_S3_BUCKET!: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_ACCESS_KEY_ID!: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_SECRET_ACCESS_KEY!: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_REGION!: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_ENDPOINT!: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_CDN_URL!: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  let message = 'Environment validation error: \n';

  if (errors.length > 0) {
    errors.forEach((error) => {
      if (error.constraints) {
        message += `- ${Object.values(error.constraints)[0]}\n`;
      }
    });

    Logger.error(message);
    throw new Error();
  }
  return validatedConfig;
}
