import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @IsNotEmpty()
  PORT!: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_URL!: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  EMAIL_RESEND_API_KEY!: string;

  @IsString()
  @IsNotEmpty()
  SECRET_KEY_PROJECT!: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET_USER!: string;

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
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
