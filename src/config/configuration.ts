export interface DatabaseConfig {
  mongoUrl: string;
  redis: {
    url: string;
    password: string;
  };
  kafka: {
    broker: string;
  };
}

export interface AwsConfig {
  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucket: string;
  };
}

interface EmailConfig {
  resendApiKey: string;
}

export interface AuthConfig {
  secretKeyProject: string;
  jwtSecretUser: string;
}

export interface Configuration {
  port: number;
  database: DatabaseConfig;
  aws: AwsConfig;
  email: EmailConfig;
  auth: AuthConfig;
}

export default (): Configuration => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    mongoUrl: process.env.DATABASE_URL || 'default_database_url',
    redis: {
      url: process.env.REDIS_URL || 'default_redis_url',
      password: process.env.REDIS_PASSWORD || 'default_redis_password',
    },
    kafka: {
      broker: process.env.KAFKA_BROKER || 'default_kafka_broker',
    },
  },
  aws: {
    s3: {
      accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || 'default_access_key_id',
      secretAccessKey:
        process.env.AWS_S3_SECRET_ACCESS_KEY || 'default_secret_access_key',
      region: process.env.AWS_S3_REGION || 'default_region',
      bucket: process.env.AWS_S3_BUCKET || 'default_bucket',
    },
  },
  email: {
    resendApiKey: process.env.EMAIL_RESEND_API_KEY || 'default_resend_api_key',
  },
  auth: {
    secretKeyProject: process.env.SECRET_KEY_PROJECT || 'default',
    jwtSecretUser: process.env.JWT_SECRET_USER || 'default',
  },
});
